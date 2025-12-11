import { FigmaFile, FigmaNode } from './figma.js';
import { DesignSystemService, DesignSystemComponent } from './design-system.js';
import { saveFile, saveBinaryFile, saveMetadata, generateRequestId, getRequestFolderPath } from '../utils/request-manager.js';

// puppeteer는 optional dependency로, 없으면 이미지 프리뷰 기능이 비활성화됨
let puppeteer: any = null;
try {
  puppeteer = (await import('puppeteer')).default;
} catch (e) {
  console.warn('puppeteer를 로드할 수 없습니다. 이미지 프리뷰 기능이 비활성화됩니다.');
}

export interface GeneratedComponent {
  name: string;
  code: string;
  imports: string[];
  dependencies: string[];
}

export type PreviewType = 'html' | 'image' | 'both';

export interface GeneratedFiles {
  requestId: string;
  folderPath: string;
  componentFile: string;
  htmlFile?: string;
  imageFile?: string;
  metadataFile: string;
}

export class CodeGenerator {
  constructor(private designSystemService: DesignSystemService) {}

  /**
   * Figma 데이터에서 React 컴포넌트 생성
   */
  async generateReactComponent(
    figmaData: FigmaFile,
    componentName: string
  ): Promise<string> {
    const imports = new Set<string>();
    const dependencies = new Set<string>();
    let componentCode = '';

    // Figma 구조 분석 및 디자인 시스템 컴포넌트 매핑
    const mappedComponents = this.mapFigmaToDesignSystem(figmaData.document, 'react');
    
    // Generate imports
    for (const mapping of mappedComponents) {
      if (mapping.designSystemComponent) {
        imports.add(`import { ${mapping.designSystemComponent.name} } from '${mapping.designSystemComponent.importPath}';`);
        if (mapping.designSystemComponent.dependencies) {
          mapping.designSystemComponent.dependencies.forEach(dep => dependencies.add(dep));
        }
      }
    }

    // 컴포넌트 구조 생성
    componentCode += this.generateReactComponentStructure(
      componentName,
      figmaData.document,
      mappedComponents
    );

    // 최상단에 임포트 추가
    const importsCode = Array.from(imports).join('\n');
    const dependenciesCode = Array.from(dependencies).length > 0 
      ? `\n// Dependencies: ${Array.from(dependencies).join(', ')}` 
      : '';

    // GitHub 저장소 정보 추가
    const repositoryInfo = `// Design System Components from GitHub:
// React: https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system-react
// Vue: https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system
// 
// To use these components, install the packages:
// npm install @dealicious/design-system-react @dealicious/design-system
// or
// yarn add @dealicious/design-system-react @dealicious/design-system
`;

    return `${repositoryInfo}\n${importsCode}${dependenciesCode}\n\n${componentCode}`;
  }

  /**
   * HTML을 렌더링하여 이미지로 변환
   * puppeteer가 없으면 빈 문자열 반환
   */
  private async generateImagePreview(
    htmlContent: string,
    componentName: string,
    requestId: string
  ): Promise<string> {
    // puppeteer가 없으면 이미지 생성 불가
    if (!puppeteer) {
      console.warn('puppeteer가 설치되지 않아 이미지 프리뷰를 생성할 수 없습니다.');
      return '';
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // 뷰포트 설정
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 2
      });
      
      // HTML 콘텐츠 설정
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      });
      
      // 컴포넌트가 렌더링될 때까지 대기
      await page.waitForSelector('#root', { timeout: 5000 }).catch(() => {
        // root 요소가 없어도 계속 진행
      });
      
      // 추가 대기 (렌더링 완료를 위해)
      await page.waitForTimeout(1000);
      
      // 페이지 높이 계산
      const bodyHeight = await page.evaluate(() => {
        return Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
      });
      
      // 스크린샷 촬영
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: true,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: Math.min(bodyHeight, 8000) // 최대 8000px
        }
      });
      
      // 이미지 파일 저장
      const imageFile = await saveBinaryFile(
        requestId,
        `${componentName}.png`,
        screenshot as Buffer
      );
      
      return imageFile;
    } finally {
      await browser.close();
    }
  }

  /**
   * React 컴포넌트 생성 및 파일 저장
   */
  async generateAndSaveReactComponent(
    figmaData: FigmaFile,
    componentName: string,
    figmaUrl: string,
    nodeId?: string,
    previewType: PreviewType = 'both'
  ): Promise<GeneratedFiles> {
    const requestId = generateRequestId();
    const folderPath = getRequestFolderPath(requestId);
    
    // React 컴포넌트 코드 생성
    const reactCode = await this.generateReactComponent(figmaData, componentName);
    
    // 컴포넌트 파일 저장
    const componentFile = await saveFile(requestId, `${componentName}.tsx`, reactCode);
    
    // HTML 미리보기 파일 생성
    const htmlContent = this.generateHTMLPreview(reactCode, componentName);
    
    let htmlFile: string | undefined;
    let imageFile: string | undefined;
    
    // 사용자 선택에 따라 파일 생성
    if (previewType === 'html' || previewType === 'both') {
      htmlFile = await saveFile(requestId, `${componentName}.html`, htmlContent);
    }
    
    if (previewType === 'image' || previewType === 'both') {
      try {
        imageFile = await this.generateImagePreview(htmlContent, componentName, requestId);
      } catch (error) {
        console.warn('이미지 생성 실패:', error);
        // 이미지 생성 실패 시에도 계속 진행
      }
    }
    
    // 메타데이터 저장
    const metadataFile = await saveMetadata(requestId, {
      type: 'react',
      componentName,
      figmaUrl,
      nodeId,
    });
    
    return {
      requestId,
      folderPath,
      componentFile,
      htmlFile,
      imageFile,
      metadataFile,
    };
  }

  /**
   * Figma 데이터에서 Vue 컴포넌트 생성
   */
  async generateVueComponent(
    figmaData: FigmaFile,
    componentName: string
  ): Promise<string> {
    const imports = new Set<string>();
    const dependencies = new Set<string>();
    let componentCode = '';

    // Figma 구조 분석 및 디자인 시스템 컴포넌트 매핑
    const mappedComponents = this.mapFigmaToDesignSystem(figmaData.document, 'vue');
    
    // Generate imports
    for (const mapping of mappedComponents) {
      if (mapping.designSystemComponent) {
        // Vue는 default import 사용하는 것을 권장
        imports.add(`import ${mapping.designSystemComponent.name} from '${mapping.designSystemComponent.importPath}';`);
        if (mapping.designSystemComponent.dependencies) {
          mapping.designSystemComponent.dependencies.forEach(dep => dependencies.add(dep));
        }
      }
    }

    // 컴포넌트 구조 생성
    componentCode += this.generateVueComponentStructure(
      componentName,
      figmaData.document,
      mappedComponents
    );

    // 최상단에 임포트 추가
    const importsCode = Array.from(imports).join('\n');
    const dependenciesCode = Array.from(dependencies).length > 0 
      ? `\n// Dependencies: ${Array.from(dependencies).join(', ')}` 
      : '';

    return `${importsCode}${dependenciesCode}\n\n${componentCode}`;
  }

  /**
   * Vue 컴포넌트 생성 및 파일 저장
   */
  async generateAndSaveVueComponent(
    figmaData: FigmaFile,
    componentName: string,
    figmaUrl: string,
    nodeId?: string,
    previewType: PreviewType = 'both'
  ): Promise<GeneratedFiles> {
    const requestId = generateRequestId();
    const folderPath = getRequestFolderPath(requestId);
    
    // Vue 컴포넌트 코드 생성
    const vueCode = await this.generateVueComponent(figmaData, componentName);
    
    // 컴포넌트 파일 저장
    const componentFile = await saveFile(requestId, `${componentName}.vue`, vueCode);
    
    // HTML 미리보기 파일 생성
    const htmlContent = this.generateHTMLPreview(vueCode, componentName, 'vue');
    
    let htmlFile: string | undefined;
    let imageFile: string | undefined;
    
    // 사용자 선택에 따라 파일 생성
    if (previewType === 'html' || previewType === 'both') {
      htmlFile = await saveFile(requestId, `${componentName}.html`, htmlContent);
    }
    
    if (previewType === 'image' || previewType === 'both') {
      try {
        imageFile = await this.generateImagePreview(htmlContent, componentName, requestId);
      } catch (error) {
        console.warn('이미지 생성 실패:', error);
        // 이미지 생성 실패 시에도 계속 진행
      }
    }
    
    // 메타데이터 저장
    const metadataFile = await saveMetadata(requestId, {
      type: 'vue',
      componentName,
      figmaUrl,
      nodeId,
    });
    
    return {
      requestId,
      folderPath,
      componentFile,
      htmlFile,
      imageFile,
      metadataFile,
    };
  }

  /**
   * HTML 미리보기 파일 생성
   */
  private generateHTMLPreview(
    componentCode: string,
    componentName: string,
    framework: 'react' | 'vue' = 'react'
  ): string {
    const escapedCode = this.escapeHtml(componentCode);
    
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName} - Preview</title>
  <script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .preview {
      margin-top: 30px;
      padding: 20px;
      border: 2px dashed #dee2e6;
      border-radius: 4px;
      background: #fff;
      min-height: 200px;
    }
    .error {
      color: red;
      padding: 10px;
      background: #ffe6e6;
      border: 1px solid #ff9999;
      border-radius: 4px;
      margin: 10px 0;
    }
    .mock-button {
      display: inline-block;
      padding: 8px 16px;
      margin: 4px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .mock-button:hover {
      background: #0056b3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${componentName} - ${framework === 'react' ? 'React' : 'Vue'} 컴포넌트 미리보기</h1>
    <div class="preview">
      <div id="root"></div>
    </div>
  </div>
  <script type="text/babel">
    // 모의 Design System 컴포넌트 정의
    const Button = ({ children, size, ...props }) => {
      const sizeStyle = size === 'small' ? { padding: '4px 8px', fontSize: '12px' } : 
                       size === 'large' ? { padding: '12px 24px', fontSize: '16px' } : 
                       { padding: '8px 16px', fontSize: '14px' };
      return React.createElement('button', {
        style: { ...sizeStyle, background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', margin: '2px' },
        ...props
      }, children);
    };
    
    const LayerPopup = ({ children, isOpen, onClose, ...props }) => {
      if (!isOpen) return null;
      return React.createElement('div', {
        style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
        onClick: onClose,
        ...props
      }, React.createElement('div', {
        style: { background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '90%', maxHeight: '90%', overflow: 'auto' },
        onClick: (e) => e.stopPropagation()
      }, children));
    };
    
    const Tab = ({ children, tabs, activeTab, onTabChange, ...props }) => {
      return React.createElement('div', { style: { borderBottom: '1px solid #ddd' }, ...props }, children);
    };
    
    const Text = ({ children, variant, size, ...props }) => {
      const style = {
        fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : '14px',
        fontWeight: variant === 'heading' ? 'bold' : 'normal',
        ...props.style
      };
      return React.createElement('span', { style, ...props }, children);
    };
    
    const LabeledText = ({ label, value, ...props }) => {
      return React.createElement('div', { style: { margin: '4px 0' }, ...props },
        React.createElement('span', { style: { fontWeight: 'bold', marginRight: '8px' } }, label + ':'),
        React.createElement('span', {}, value || '')
      );
    };
    
    const Input = ({ placeholder, value, onChange, ...props }) => {
      return React.createElement('input', {
        type: 'text',
        placeholder,
        value: value || '',
        onChange: onChange || (() => {}),
        style: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px', margin: '4px', width: '200px' },
        ...props
      });
    };
    
    const Chip = ({ children, variant, size, onDelete, ...props }) => {
      return React.createElement('span', {
        style: {
          display: 'inline-block',
          padding: '4px 8px',
          background: variant === 'filled' ? '#007bff' : '#f0f0f0',
          color: variant === 'filled' ? 'white' : 'black',
          borderRadius: '16px',
          margin: '2px',
          fontSize: size === 'small' ? '12px' : '14px'
        },
        ...props
      }, children, onDelete && React.createElement('button', {
        onClick: onDelete,
        style: { marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }
      }, '×'));
    };
    
    const Switch = ({ checked, onChange, label, ...props }) => {
      return React.createElement('label', { style: { display: 'flex', alignItems: 'center', margin: '4px' }, ...props },
        React.createElement('input', {
          type: 'checkbox',
          checked: checked || false,
          onChange: onChange || (() => {}),
          style: { marginRight: '8px' }
        }),
        label && React.createElement('span', {}, label)
      );
    };
    
    const ArrowPagination = ({ currentPage, totalPages, onPageChange, children, ...props }) => {
      return React.createElement('div', { style: { display: 'flex', alignItems: 'center', margin: '4px' }, ...props }, children);
    };
    
    const Accordion = ({ title, children, defaultExpanded, disabled, ...props }) => {
      const [expanded, setExpanded] = React.useState(defaultExpanded || false);
      if (disabled) return null;
      return React.createElement('div', { style: { border: '1px solid #ddd', borderRadius: '4px', margin: '4px' }, ...props },
        React.createElement('div', {
          onClick: () => setExpanded(!expanded),
          style: { padding: '8px', cursor: 'pointer', background: '#f5f5f5', fontWeight: 'bold' }
        }, title || 'Accordion'),
        expanded && React.createElement('div', { style: { padding: '8px' } }, children)
      );
    };
    
    // 컴포넌트 코드 정리
    const cleanCode = ${JSON.stringify(componentCode)}
      .replace(/import[^;]+;/g, '')
      .replace(/\/\/[^\\n]*/g, '')
      .replace(/interface[^\\{]*\\{[^\\}]*\\}/g, '')
      .replace(/React\\.FC<[^>]*>/g, '')
      .replace(/export default ${componentName};/g, '')
      .replace(new RegExp(\`const ${componentName}:.*?=\`, 'g'), \`const ${componentName} = \`)
      // 문법 오류 수정: 잘못된 prop 형식 수정
      .replace(/<Button\\s+>([^<]+)\\s+size="([^"]+)">/g, '<Button size="$2">$1</Button>')
      .replace(/<Button\\s+>([^<]+)\\s+size="([^"]+)">/g, '<Button size="$2">$1</Button>')
      // 빈 Button 태그 정리
      .replace(/<Button\\s*><\\/Button>/g, '<Button></Button>')
      .replace(/<Button\\s+size="([^"]+)"\\s*><\\/Button>/g, '<Button size="$1"></Button>');
    
    try {
      const transformedCode = Babel.transform(cleanCode, { presets: ['react'] }).code;
      eval(transformedCode);
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(${componentName}, {}));
    } catch (error) {
      console.error('렌더링 오류:', error);
      const errorDiv = document.getElementById('root');
      errorDiv.innerHTML = '<div class="error"><strong>렌더링 오류:</strong><br>' + 
        error.message + '<br><br><strong>스택:</strong><br>' + 
        (error.stack || '스택 정보 없음') + '</div>';
    }
  </script>
</body>
</html>`;
  }

  /**
   * HTML 이스케이프
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Figma 노드를 디자인 시스템 컴포넌트에 매핑
   */
  private mapFigmaToDesignSystem(
    node: FigmaNode,
    framework: 'react' | 'vue'
  ): Array<{
    figmaNode: FigmaNode;
    designSystemComponent: DesignSystemComponent;
    confidence: number;
  }> {
    const mappings: Array<{
      figmaNode: FigmaNode;
      designSystemComponent: DesignSystemComponent;
      confidence: number;
    }> = [];

    // 현재 노드 분석
    const mapping = this.analyzeNode(node, framework);
    mappings.push(mapping);

    // 자식 노드 재귀적 분석
    if (node.children) {
      for (const child of node.children) {
        mappings.push(...this.mapFigmaToDesignSystem(child, framework));
      }
    }

    return mappings;
  }

  /**
   * 단일 Figma 노드 분석 및 디자인 시스템 최적 매칭 찾기
   * 항상 디자인 시스템 컴포넌트를 반환 - null이 아님
   */
  private analyzeNode(
    node: FigmaNode,
    framework: 'react' | 'vue'
  ): {
    figmaNode: FigmaNode;
    designSystemComponent: DesignSystemComponent;
    confidence: number;
  } {
    // 보이지 않는 노드 건너뛰기
    if (node.visible === false) {
      const defaultComponent = this.designSystemService.getComponent('Button', framework);
      if (!defaultComponent) {
        // Button은 항상 사용 가능하므로 이 경우는 절대 발생하지 않음
        throw new Error('No Design System components available');
      }
      return {
        figmaNode: node,
        designSystemComponent: defaultComponent,
        confidence: 0.1,
      };
    }

    // 노드 속성에 따라 매칭 컴포넌트 찾기
    let component = this.findComponentByNodeProperties(node, framework);
    
    // 매칭 컴포넌트가 없으면 노드 유형에 따라 기본 컴포넌트 사용
    if (!component) {
      component = this.getDefaultComponentByType(node, framework);
    }
    
    // component가 null인 경우 (컨테이너 역할만 하는 경우) div로 처리하기 위해 특별한 컴포넌트 사용
    // 실제로는 generateReactJSX에서 null 체크하여 div로 처리
    if (!component) {
      // div로 처리하기 위한 플레이스홀더 컴포넌트 생성
      component = {
        name: 'div',
        description: 'Container div',
        category: 'Layout',
        importPath: '',
        props: [],
        examples: [],
      } as DesignSystemComponent;
    }
    
    return {
      figmaNode: node,
      designSystemComponent: component,
      confidence: component.name === 'div' ? 0.5 : 0.8,
    };
  }

  /**
   * Figma 노드 속성에 따라 디자인 시스템 컴포넌트 찾기
   * 노드 타입, 이름, 구조, 속성을 종합적으로 분석하여 적절한 컴포넌트 매핑
   */
  private findComponentByNodeProperties(
    node: FigmaNode,
    framework: 'react' | 'vue'
  ): DesignSystemComponent | null {
    const nodeName = node.name.toLowerCase();
    const nodeType = node.type;

    // 1. 직접 이름 매칭 (가장 정확한 매칭)
    let component = this.designSystemService.findBestMatch(nodeName, framework);
    if (component) return component;

    // 2. 노드 타입과 구조 기반 매칭
    switch (nodeType) {
      case 'TEXT':
        // TEXT 노드는 Text 컴포넌트 사용
        // 단, 버튼 레이블로 사용되는 경우는 제외
        if (this.isButtonLabel(node)) {
          return this.designSystemService.getComponent('Button', framework);
        }
        // 링크 텍스트인지 확인
        if (nodeName.includes('link') || nodeName.includes('href') || this.hasLinkParent(node)) {
          return this.designSystemService.getComponent('TextLink', framework);
        }
        // 기본 텍스트는 Text 컴포넌트 사용
        return this.designSystemService.getComponent('Text', framework);
        
      case 'FRAME':
        // FRAME 노드는 자식 구조를 분석하여 적절한 컴포넌트 선택
        return this.analyzeFrameNode(node, framework);
        
      case 'COMPONENT':
        // Component 인스턴스 - 이름 기반 매칭
        component = this.designSystemService.findBestMatch(nodeName, framework);
        if (component) return component;
        // 컴포넌트 인스턴스는 자식 구조 분석
        return this.analyzeFrameNode(node, framework);
        
      case 'RECTANGLE':
        // RECTANGLE 노드는 이름과 자식 구조 분석
        if (nodeName.includes('button') || nodeName.includes('btn') || nodeName.includes('click')) {
          return this.designSystemService.getComponent('Button', framework);
        }
        if (nodeName.includes('input') || nodeName.includes('field')) {
          return this.designSystemService.getComponent('Input', framework);
        }
        if (nodeName.includes('badge') || nodeName.includes('tag') || nodeName.includes('label')) {
          const badgeComponent = this.designSystemService.getComponent('Badge', framework);
          if (badgeComponent) return badgeComponent;
          return this.designSystemService.getComponent('Tag', framework);
        }
        if (nodeName.includes('chip')) {
          return this.designSystemService.getComponent('Chip', framework);
        }
        // 사각형은 자식 구조 분석
        return this.analyzeFrameNode(node, framework);
        
      case 'GROUP':
        // GROUP은 컨테이너 역할만 하므로 자식 구조 분석
        return this.analyzeFrameNode(node, framework);
        
      default:
        // 알 수 없는 타입은 자식 구조 분석
        return this.analyzeFrameNode(node, framework);
    }
  }

  /**
   * FRAME 노드 분석 - 자식 구조를 기반으로 적절한 컴포넌트 선택
   */
  private analyzeFrameNode(
    node: FigmaNode,
    framework: 'react' | 'vue'
  ): DesignSystemComponent | null {
    const nodeName = node.name.toLowerCase();
    
    // 이름 기반 매칭 (우선순위 높음)
    if (nodeName.includes('tab') || nodeName.includes('tabs')) {
      return this.designSystemService.getComponent('Tab', framework);
    }
    if (nodeName.includes('accordion') || nodeName.includes('collapse')) {
      return this.designSystemService.getComponent('Accordion', framework);
    }
    if (nodeName.includes('modal') || nodeName.includes('dialog') || nodeName.includes('popup')) {
      return this.designSystemService.getComponent('Modal', framework);
    }
    if (nodeName.includes('button') || nodeName.includes('btn')) {
      return this.designSystemService.getComponent('Button', framework);
    }
    if (nodeName.includes('badge')) {
      return this.designSystemService.getComponent('Badge', framework);
    }
    if (nodeName.includes('tag')) {
      return this.designSystemService.getComponent('Tag', framework);
    }
    if (nodeName.includes('chip')) {
      return this.designSystemService.getComponent('Chip', framework);
    }
    if (nodeName.includes('labeled') || nodeName.includes('label-text')) {
      return this.designSystemService.getComponent('LabeledText', framework);
    }
    if (nodeName.includes('text-link') || nodeName.includes('link')) {
      return this.designSystemService.getComponent('TextLink', framework);
    }
    
    // 자식 노드 구조 분석
    if (node.children && node.children.length > 0) {
      // 자식이 모두 TEXT인 경우 - Text 또는 LabeledText
      const allTextChildren = node.children.every(child => child.type === 'TEXT');
      if (allTextChildren && node.children.length === 1) {
        return this.designSystemService.getComponent('Text', framework);
      }
      if (allTextChildren && node.children.length === 2) {
        // 라벨과 값이 있는 경우 LabeledText
        return this.designSystemService.getComponent('LabeledText', framework);
      }
      
      // 자식에 Tab이 있는 경우 - Tab 컴포넌트
      const hasTabChildren = node.children.some(child => 
        child.name.toLowerCase().includes('tab') || 
        child.type === 'COMPONENT' && child.name.toLowerCase().includes('tab')
      );
      if (hasTabChildren) {
        return this.designSystemService.getComponent('Tab', framework);
      }
      
      // 자식에 Accordion이 있는 경우
      const hasAccordionChildren = node.children.some(child => 
        child.name.toLowerCase().includes('accordion') || 
        child.type === 'COMPONENT' && child.name.toLowerCase().includes('accordion')
      );
      if (hasAccordionChildren) {
        return this.designSystemService.getComponent('Accordion', framework);
      }
      
      // 레이아웃 모드가 있는 경우 (Auto Layout)
      if (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL') {
        // Auto Layout은 일반적으로 컨테이너 역할
        // 자식이 버튼인 경우 Button 그룹으로 처리하지 않고 div로 처리
        return null; // null을 반환하면 div로 처리
      }
    }
    
    // 기본적으로 컨테이너 역할만 하는 경우 null 반환 (div로 처리)
    return null;
  }

  /**
   * 노드가 버튼 레이블인지 확인
   */
  private isButtonLabel(node: FigmaNode): boolean {
    // 부모 노드가 버튼인지 확인하는 로직은 현재 노드 구조로는 어려움
    // 이름 기반으로 판단
    const nodeName = node.name.toLowerCase();
    return nodeName.includes('button') || nodeName.includes('btn') || nodeName.includes('click');
  }

  /**
   * 노드가 링크의 일부인지 확인
   */
  private hasLinkParent(node: FigmaNode): boolean {
    // 현재 구현에서는 이름 기반으로 판단
    const nodeName = node.name.toLowerCase();
    return nodeName.includes('link') || nodeName.includes('href');
  }

  /**
   * 기본 디자인 시스템 컴포넌트 가져오기
   */
  private async getDefaultComponent(framework: 'react' | 'vue'): Promise<DesignSystemComponent> {
    // Button을 기본 컴포넌트로 사용 (항상 존재함)
    const buttonComponent = this.designSystemService.getComponent('Button', framework);
    if (buttonComponent) return buttonComponent;
    
    // Button이 없으면 첫 번째 사용 가능한 컴포넌트 사용
    const components = await this.designSystemService.getAvailableComponents(framework);
    if (components.length === 0) {
      throw new Error('No Design System components available');
    }
    return components[0];
  }

  /**
   * 노드 유형에 따라 기본 컴포넌트 가져오기
   * findComponentByNodeProperties에서 매칭되지 않은 경우에만 사용
   */
  private getDefaultComponentByType(node: FigmaNode, framework: 'react' | 'vue'): DesignSystemComponent {
    const nodeType = node.type;
    const nodeName = node.name.toLowerCase();

    // 노드 유형과 이름에 따라 스마트 기본값
    switch (nodeType) {
      case 'TEXT':
        // Text 노드는 Text 컴포넌트 사용
        const textComponent = this.designSystemService.getComponent('Text', framework);
        if (textComponent) return textComponent;
        break;
        
      case 'RECTANGLE':
        // Rectangle은 이름 기반으로 판단
        if (nodeName.includes('button') || nodeName.includes('btn')) {
          const buttonComponent = this.designSystemService.getComponent('Button', framework);
          if (buttonComponent) return buttonComponent;
        }
        if (nodeName.includes('badge') || nodeName.includes('tag')) {
          const badgeComponent = this.designSystemService.getComponent('Badge', framework);
          if (badgeComponent) return badgeComponent;
        }
        // 기본적으로 div로 처리 (null 반환하면 div 사용)
        break;
        
      case 'FRAME':
      case 'GROUP':
        // Frame과 Group은 컨테이너 역할만 하므로 div 사용 (null 반환)
        break;
        
      default:
        // 알 수 없는 타입은 div 사용
        break;
    }
    
    // 최종 폴백 - Button 사용 (최후의 수단)
    const finalButtonComponent = this.designSystemService.getComponent('Button', framework);
    if (finalButtonComponent) return finalButtonComponent;
    
    // Button이 없으면 첫 번째 사용 가능한 컴포넌트 사용
    const components = framework === 'react' 
      ? this.designSystemService['reactComponents'] 
      : this.designSystemService['vueComponents'];
    
    if (components && components.length > 0) {
      return components[0];
    }
    
    throw new Error('No Design System components available');
  }

  /**
   * React 컴포넌트 구조 생성
   */
  private generateReactComponentStructure(
    componentName: string,
    rootNode: FigmaNode,
    mappedComponents: Array<{
      figmaNode: FigmaNode;
      designSystemComponent: DesignSystemComponent;
      confidence: number;
    }>
  ): string {
    let code = `import React from 'react';\n\n`;
    
    code += `interface ${componentName}Props {\n`;
    code += `  // Add your props here\n`;
    code += `}\n\n`;
    
    code += `const ${componentName}: React.FC<${componentName}Props> = (props) => {\n`;
    code += `  return (\n`;
    code += `    <div>\n`;
    
    // 매핑된 컴포넌트에 따라 JSX 생성
    code += this.generateReactJSX(rootNode, mappedComponents, 2);
    
    code += `    </div>\n`;
    code += `  );\n`;
    code += `};\n\n`;
    code += `export default ${componentName};\n`;
    
    return code;
  }

  /**
   * Vue 컴포넌트 구조 생성
   */
  private generateVueComponentStructure(
    componentName: string,
    rootNode: FigmaNode,
    mappedComponents: Array<{
      figmaNode: FigmaNode;
      designSystemComponent: DesignSystemComponent;
      confidence: number;
    }>
  ): string {
    let code = `<template>\n`;
    code += `  <div>\n`;
    
    // 매핑된 컴포넌트에 따라 템플릿 생성
    code += this.generateVueTemplate(rootNode, mappedComponents, 2);
    
    code += `  </div>\n`;
    code += `</template>\n\n`;
    
    code += `<script setup lang="ts">\n`;
    code += `// Add your reactive data and methods here\n`;
    code += `</script>\n\n`;
    
    code += `<style scoped>\n`;
    code += `/* Add your styles here */\n`;
    code += `</style>\n`;
    
    return code;
  }

  /**
   * Figma 노드에서 React JSX 생성
   * 불필요한 중첩을 제거하여 깊이를 최소화
   */
  private generateReactJSX(
    node: FigmaNode,
    mappedComponents: Array<{
      figmaNode: FigmaNode;
      designSystemComponent: DesignSystemComponent;
      confidence: number;
    }>,
    indent: number = 0,
    parentComponent?: DesignSystemComponent
  ): string {
    const indentStr = '  '.repeat(indent);
    let jsx = '';

    // 보이지 않는 노드는 건너뛰기
    if (node.visible === false) {
      return '';
    }

    // 현재 노드에 대한 매핑 찾기
    const mapping = mappedComponents.find(m => m.figmaNode.id === node.id);
    
    if (mapping?.designSystemComponent) {
      const component = mapping.designSystemComponent;
      
      // 1. 같은 타입의 컴포넌트가 중첩되는 경우 부모를 건너뛰고 자식만 렌더링
      if (parentComponent && parentComponent.name === component.name) {
        // 같은 타입 중첩 방지 - 자식만 렌더링
        if (node.children) {
          for (const child of node.children) {
            jsx += this.generateReactJSX(child, mappedComponents, indent, component);
          }
        } else if (node.characters) {
          // 텍스트만 있는 경우 직접 반환
          return `${indentStr}${node.characters}\n`;
        }
        return jsx;
      }
      
      // 2. div 컨테이너는 가능한 한 건너뛰기 (자식이 하나만 있는 경우)
      if (component.name === 'div') {
        // 빈 div 제거
        if (!node.children && !node.characters) {
          return '';
        }
        
        // 자식이 하나만 있고 그 자식도 div가 아닌 경우 div를 건너뛰기
        if (node.children && node.children.length === 1) {
          const singleChild = node.children[0];
          const childMapping = mappedComponents.find(m => m.figmaNode.id === singleChild.id);
          if (childMapping && childMapping.designSystemComponent.name !== 'div') {
            // div를 건너뛰고 자식만 렌더링
            return this.generateReactJSX(singleChild, mappedComponents, indent, component);
          }
        }
        
        // 여러 자식이 있거나 자식이 div인 경우에만 div 사용
        // className은 추가하지 않음 (불필요한 className 방지)
        const style = this.generateInlineStyle(node);
        jsx += `${indentStr}<div${style}>\n`;
        
        if (node.children) {
          for (const child of node.children) {
            jsx += this.generateReactJSX(child, mappedComponents, indent + 1, component);
          }
        } else if (node.characters) {
          jsx += `${indentStr}  ${node.characters}\n`;
        }
        
        jsx += `${indentStr}</div>\n`;
        return jsx;
      }
      
      // 3. 빈 컴포넌트 제거
      const hasChildren = node.children && node.children.length > 0;
      const hasText = node.characters && node.characters.trim().length > 0;
      
      if (!hasChildren && !hasText) {
        if (['Button', 'Chip', 'Badge', 'Tag', 'Icon'].includes(component.name)) {
          return '';
        }
        if (component.name === 'Text' || component.name === 'TextLink') {
          return '';
        }
      }
      
      // 4. 자식이 하나만 있고 같은 타입이 아닌 경우 중간 노드 건너뛰기 고려
      // 단, Chip, Badge, Tag는 텍스트를 children으로 받으므로 예외
      if (hasChildren && node.children && node.children.length === 1 && !hasText) {
        const singleChild = node.children[0];
        const childMapping = mappedComponents.find(m => m.figmaNode.id === singleChild.id);
        
        // Chip, Badge, Tag는 텍스트를 children으로 받으므로 중간 노드 건너뛰지 않음
        if (['Chip', 'Badge', 'Tag'].includes(component.name)) {
          // Chip/Badge/Tag 안에 Text가 있으면 Text를 children으로 사용
          if (childMapping && childMapping.designSystemComponent.name === 'Text' && singleChild.characters) {
            // Text 노드의 텍스트를 직접 children으로 사용
            const props = this.generateComponentProps(node, component);
            jsx += `${indentStr}<${component.name}${props}>\n`;
            jsx += `${indentStr}  ${singleChild.characters}\n`;
            jsx += `${indentStr}</${component.name}>\n`;
            return jsx;
          }
        }
        
        // 자식이 같은 타입이 아니고, 자식이 텍스트나 의미있는 컴포넌트인 경우
        if (childMapping && childMapping.designSystemComponent.name !== component.name) {
          // 부모 컴포넌트의 props를 자식에 병합할 수 있는지 확인
          // 단순 컨테이너 역할만 하는 경우 자식만 렌더링
          if (this.isSimpleContainer(component, node)) {
            return this.generateReactJSX(singleChild, mappedComponents, indent, component);
          }
        }
      }
      
      // 5. 디자인 시스템 컴포넌트 렌더링
      const props = this.generateComponentProps(node, component);
      
      // Chip, Badge, Tag는 자식이 Text인 경우 텍스트만 추출
      // 또는 자식이 Button이고 그 안에 Text나 Tag가 있는 경우 Button을 제거
      if (['Chip', 'Badge', 'Tag'].includes(component.name) && hasChildren && !hasText && node.children) {
        // 자식이 모두 Button이고 그 안에 Text나 Tag가 있는 경우 Button 제거
        const buttonChildren = node.children.filter(child => {
          const childMapping = mappedComponents.find(m => m.figmaNode.id === child.id);
          return childMapping && childMapping.designSystemComponent.name === 'Button';
        });
        
        if (buttonChildren.length === node.children.length && buttonChildren.length > 0) {
          // Button의 자식을 직접 사용
          const directChildren: FigmaNode[] = [];
          for (const buttonChild of buttonChildren) {
            if (buttonChild.children) {
              directChildren.push(...buttonChild.children);
            }
          }
          
          // 직접 자식이 모두 Text나 Tag인 경우
          if (directChildren.length > 0) {
            const textOrTagChildren = directChildren.filter(child => {
              const childMapping = mappedComponents.find(m => m.figmaNode.id === child.id);
              return childMapping && 
                     (childMapping.designSystemComponent.name === 'Text' || 
                      childMapping.designSystemComponent.name === 'Tag' ||
                      child.characters);
            });
            
            // Button을 제거하고 직접 자식만 사용
            if (textOrTagChildren.length > 0) {
              jsx += `${indentStr}<${component.name}${props}>\n`;
              for (const child of directChildren) {
                jsx += this.generateReactJSX(child, mappedComponents, indent + 1, component);
              }
              jsx += `${indentStr}</${component.name}>\n`;
              return jsx;
            }
          }
        }
        
        // 자식이 모두 Text인 경우 텍스트만 children으로 사용
        const textChildren = node.children ? node.children.filter((child: FigmaNode) => {
          const childMapping = mappedComponents.find(m => m.figmaNode.id === child.id);
          return childMapping && 
                 (childMapping.designSystemComponent.name === 'Text' || 
                  child.characters);
        }) : [];
        
        if (node.children && textChildren.length === node.children.length && textChildren.length > 0) {
          const textContent = textChildren
            .map((child: FigmaNode) => child.characters || '')
            .filter((text: string) => text.trim().length > 0)
            .join(' ');
          
          if (textContent) {
            jsx += `${indentStr}<${component.name}${props}>\n`;
            jsx += `${indentStr}  ${textContent}\n`;
            jsx += `${indentStr}</${component.name}>\n`;
            return jsx;
          }
        }
      }
      
      jsx += `${indentStr}<${component.name}${props}>\n`;
      
      if (hasChildren && node.children) {
        for (const child of node.children) {
          jsx += this.generateReactJSX(child, mappedComponents, indent + 1, component);
        }
      } else if (hasText) {
        jsx += `${indentStr}  ${node.characters}\n`;
      }
      
      jsx += `${indentStr}</${component.name}>\n`;
    } else {
      // 매핑이 없는 경우 div로 처리
      if (!node.children && !node.characters) {
        return '';
      }
      
      // 자식이 하나만 있는 경우 div를 건너뛰기
      if (node.children && node.children.length === 1 && !node.characters) {
        return this.generateReactJSX(node.children[0], mappedComponents, indent, parentComponent);
      }
      
      // className은 추가하지 않음 (불필요한 className 방지)
      const style = this.generateInlineStyle(node);
      jsx += `${indentStr}<div${style}>\n`;
      
      if (node.children) {
        for (const child of node.children) {
          jsx += this.generateReactJSX(child, mappedComponents, indent + 1, parentComponent);
        }
      } else if (node.characters) {
        jsx += `${indentStr}  ${node.characters}\n`;
      }
      
      jsx += `${indentStr}</div>\n`;
    }

    return jsx;
  }

  /**
   * 컴포넌트가 단순 컨테이너 역할만 하는지 확인
   */
  private isSimpleContainer(
    component: DesignSystemComponent,
    node: FigmaNode
  ): boolean {
    // div는 항상 컨테이너
    if (component.name === 'div') return true;
    
    // Button이 텍스트나 의미있는 자식 없이 자식만 있는 경우 컨테이너로 간주
    if (component.name === 'Button' && !node.characters && node.children) {
      // 자식이 모두 빈 노드가 아닌 경우에만 컨테이너로 간주
      return true;
    }
    
    // Chip, Badge, Tag도 비슷하게 처리
    if (['Chip', 'Badge', 'Tag'].includes(component.name) && !node.characters && node.children) {
      return true;
    }
    
    return false;
  }

  /**
   * Figma 노드에서 Vue 템플릿 생성
   */
  private generateVueTemplate(
    node: FigmaNode,
    mappedComponents: Array<{
      figmaNode: FigmaNode;
      designSystemComponent: DesignSystemComponent;
      confidence: number;
    }>,
    indent: number = 0
  ): string {
    const indentStr = '  '.repeat(indent);
    let template = '';

    // 현재 노드에 대한 매핑 찾기
    const mapping = mappedComponents.find(m => m.figmaNode.id === node.id);
    
    // 항상 디자인 시스템 컴포넌트 사용 - HTML로 폴백하지 않음
    if (mapping?.designSystemComponent) {
      const component = mapping.designSystemComponent;
      const props = this.generateComponentProps(node, component);
      template += `${indentStr}<${component.name}${props}>\n`;
      
      if (node.children) {
        for (const child of node.children) {
          template += this.generateVueTemplate(child, mappedComponents, indent + 1);
        }
      } else if (node.characters) {
        template += `${indentStr}  ${node.characters}\n`;
      }
      
      template += `${indentStr}</${component.name}>\n`;
    } else {
      // 일반적인 패턴 기반 유사 매칭을 사용하므로 이 경우는 절대 발생하지 않음
      console.warn(`No Design System component found for node ${node.id}, using Button as fallback`);
      const fallbackComponent = this.designSystemService.getComponent('Button', 'vue');
      if (fallbackComponent) {
        template += `${indentStr}<${fallbackComponent.name}>\n`;
        
        if (node.children) {
          for (const child of node.children) {
            template += this.generateVueTemplate(child, mappedComponents, indent + 1);
          }
        } else if (node.characters) {
          template += `${indentStr}  ${node.characters}\n`;
        }
        
        template += `${indentStr}</${fallbackComponent.name}>\n`;
      }
    }

    return template;
  }

  /**
   * Figma 노드와 디자인 시스템 컴포넌트에 따라 컴포넌트 속성 생성
   */
  private generateComponentProps(
    node: FigmaNode,
    component: DesignSystemComponent
  ): string {
    const props: string[] = [];

    // Input 컴포넌트의 경우 placeholder 추가
    if (node.characters && component.name === 'Input') {
      props.push(`placeholder="${node.characters}"`);
    }

    // Text 컴포넌트의 경우 children으로 텍스트 전달 (props가 아닌)
    // Text 컴포넌트는 children으로 텍스트를 받으므로 props에 추가하지 않음

    // 바운딩 박스에 따라 크기 속성 추가
    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;
      
      if (component.name === 'Button') {
        if (height < 32) props.push('size="small"');
        else if (height > 48) props.push('size="large"');
        else if (height >= 32) props.push('size="medium"');
      }
      
      // Chip, Badge, Tag도 크기 속성 지원하는 경우
      if (component.name === 'Chip' || component.name === 'Badge' || component.name === 'Tag') {
        if (height < 24) props.push('size="small"');
        else if (height > 32) props.push('size="large"');
      }
    }

    // Accordion의 경우 title prop 추가
    if (component.name === 'Accordion' && node.children && node.children.length > 0) {
      const firstTextChild = node.children.find(child => child.type === 'TEXT' || child.characters);
      if (firstTextChild && firstTextChild.characters) {
        props.push(`title="${firstTextChild.characters}"`);
      }
    }

    return props.length > 0 ? ` ${props.join(' ')}` : '';
  }

  /**
   * Figma 노드에 대한 적절한 HTML 태그 이름 가져오기
   */
  private getHTMLTagName(node: FigmaNode): string {
    switch (node.type) {
      case 'TEXT':
        return 'span';
      case 'FRAME':
        return 'div';
      case 'RECTANGLE':
        return 'div';
      case 'ELLIPSE':
        return 'div';
      default:
        return 'div';
    }
  }

  /**
   * Figma 노드에서 CSS 클래스 이름 생성
   */
  private generateClassName(node: FigmaNode): string {
    const name = node.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `${name}-${node.id.slice(-4)}`;
  }

  /**
   * Figma 노드 속성에서 인라인 스타일 생성
   */
  private generateInlineStyle(node: FigmaNode): string {
    const styles: string[] = [];

    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;
      styles.push(`width: ${width}px`);
      styles.push(`height: ${height}px`);
    }

    if (node.cornerRadius) {
      styles.push(`border-radius: ${node.cornerRadius}px`);
    }

    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        const { r, g, b, a } = fill.color;
        const alpha = a !== undefined ? a : 1;
        styles.push(`background-color: rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`);
      }
    }

    if (node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0];
      if (stroke.type === 'SOLID' && stroke.color) {
        const { r, g, b, a } = stroke.color;
        const alpha = a !== undefined ? a : 1;
        styles.push(`border: ${stroke.strokeWeight || 1}px solid rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`);
      }
    }

    return styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
  }
}
