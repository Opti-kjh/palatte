import axios from 'axios';
import { FigmaMCPClient } from '../utils/figma-mcp-client.js';

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    gradientStops?: Array<{
      position: number;
      color: {
        r: number;
        g: number;
        b: number;
        a: number;
      };
    }>;
  }>;
  strokes?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    strokeWeight?: number;
  }>;
  cornerRadius?: number;
  characters?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
  };
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, FigmaNode>;
  styles: Record<string, any>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
}

export interface FigmaAnalysis {
  totalNodes: number;
  componentCount: number;
  frameCount: number;
  textCount: number;
  availableComponents: string[];
  suggestedMappings: Array<{
    figmaComponent: string;
    designSystemComponent: string;
    confidence: number;
  }>;
}

export class FigmaService {
  private accessToken: string;
  private baseUrl = 'https://api.figma.com/v1';
  private mcpClient: FigmaMCPClient | null = null;
  private useMCP: boolean;

  constructor(useMCP: boolean = true, mcpBaseUrl?: string) {
    this.accessToken = process.env.FIGMA_ACCESS_TOKEN || '';
    this.useMCP = useMCP;
    
    if (useMCP) {
      const mcpUrl = mcpBaseUrl || process.env.FIGMA_MCP_SERVER_URL || 'http://127.0.0.1:3845/mcp';
      this.mcpClient = new FigmaMCPClient(mcpUrl);
    }
    
    if (!this.accessToken) {
      console.warn('환경 변수에서 FIGMA_ACCESS_TOKEN을 찾을 수 없습니다.');
    }
  }

  /**
   * Figma URL에서 파일 ID 추출
   */
  private extractFileId(url: string): string {
    // /file/ 또는 /design/ 경로에서 파일 ID 추출
    const match = url.match(/\/(?:file|design)\/([a-zA-Z0-9]+)/);
    if (match) {
      return match[1];
    }
    // 이미 파일 ID인 경우
    if (/^[a-zA-Z0-9]+$/.test(url)) {
      return url;
    }
    throw new Error('잘못된 Figma URL 형식입니다.');
  }

  /**
   * Figma URL에서 node-id 추출
   */
  extractNodeId(url: string): string | undefined {
    const match = url.match(/[?&]node-id=([^&]+)/);
    if (match) {
      // node-id는 URL 인코딩되어 있을 수 있으므로 디코딩
      return decodeURIComponent(match[1]);
    }
    return undefined;
  }

  /**
   * MCP 응답을 FigmaFile 형식으로 변환
   */
  private transformMCPResponseToFigmaFile(mcpData: any): FigmaFile {
    // MCP 응답 형식에 따라 변환 로직 구현
    // Figma MCP 서버의 응답 구조에 맞게 조정 필요
    if (!mcpData) {
      throw new Error('MCP 응답 데이터가 없습니다.');
    }

    // MCP 응답이 이미 FigmaFile 형식인 경우
    if (mcpData.document) {
      return {
        document: mcpData.document,
        components: mcpData.components || {},
        styles: mcpData.styles || {},
        name: mcpData.name || 'Untitled',
        lastModified: mcpData.lastModified || new Date().toISOString(),
        thumbnailUrl: mcpData.thumbnailUrl || '',
      };
    }

    // MCP 응답이 다른 형식인 경우 변환
    // content 배열에서 데이터 추출 (MCP 도구 응답 형식)
    if (mcpData.content && Array.isArray(mcpData.content)) {
      const textContent = mcpData.content.find((c: any) => c.type === 'text');
      if (textContent) {
        try {
          const parsed = JSON.parse(textContent.text);
          return this.transformMCPResponseToFigmaFile(parsed);
        } catch {
          // JSON이 아닌 경우 처리
        }
      }
    }

    // 기본 구조로 변환 시도
    return {
      document: mcpData.document || mcpData.node || { id: 'root', name: 'Document', type: 'DOCUMENT', children: [] },
      components: mcpData.components || {},
      styles: mcpData.styles || {},
      name: mcpData.name || 'Untitled',
      lastModified: mcpData.lastModified || new Date().toISOString(),
      thumbnailUrl: mcpData.thumbnailUrl || '',
    };
  }

  /**
   * Figma 파일 데이터 가져오기
   * MCP 서버를 우선 사용하고, 실패 시 기존 REST API로 폴백
   */
  async getFigmaData(url: string, nodeId?: string): Promise<FigmaFile> {
    const fileId = this.extractFileId(url);
    
    // MCP 클라이언트 사용 시도
    if (this.useMCP && this.mcpClient !== null) {
      try {
        const isAvailable = await this.mcpClient.isAvailable();
        if (isAvailable) {
          const mcpData = nodeId
            ? await this.mcpClient.getNodeData(fileId, nodeId)
            : await this.mcpClient.getFileData(fileId, nodeId);
          
          if (mcpData) {
            try {
              return this.transformMCPResponseToFigmaFile(mcpData);
            } catch (error) {
              console.warn('MCP 응답 변환 실패, REST API로 폴백:', error);
              // 폴백으로 REST API 사용
            }
          }
        }
      } catch (error) {
        console.warn('Figma MCP 서버 연결 실패, REST API로 폴백:', error);
        // 폴백으로 REST API 사용
      }
    }

    // REST API 폴백
    if (!this.accessToken) {
      throw new Error('Figma 액세스 토큰이 필요합니다. MCP 서버도 사용할 수 없습니다.');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/files/${fileId}`, {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
        params: {
          ids: nodeId || undefined,
        },
      });

      return {
        document: response.data.document,
        components: response.data.components || {},
        styles: response.data.styles || {},
        name: response.data.name,
        lastModified: response.data.lastModified,
        thumbnailUrl: response.data.thumbnailUrl,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Figma 파일 구조 분석
   */
  async analyzeFigmaFile(url: string): Promise<string> {
    const fileData = await this.getFigmaData(url);
    
    const analysis = this.analyzeFileStructure(fileData);
    
    return this.formatAnalysis(analysis);
  }

  /**
   * 파일 구조 분석 및 컴포넌트 정보 추출
   */
  private analyzeFileStructure(file: FigmaFile): FigmaAnalysis {
    const stats = this.countNodes(file.document);
    const availableComponents = Object.keys(file.components);
    
    return {
      totalNodes: stats.total,
      componentCount: stats.components,
      frameCount: stats.frames,
      textCount: stats.text,
      availableComponents,
      suggestedMappings: this.suggestComponentMappings(availableComponents),
    };
  }

  /**
   * 파일에 있는 다른 유형의 노드 수 세기
   */
  private countNodes(node: FigmaNode): {
    total: number;
    components: number;
    frames: number;
    text: number;
  } {
    let total = 1;
    let components = node.type === 'COMPONENT' ? 1 : 0;
    let frames = node.type === 'FRAME' ? 1 : 0;
    let text = node.type === 'TEXT' ? 1 : 0;

    if (node.children) {
      for (const child of node.children) {
        const childStats = this.countNodes(child);
        total += childStats.total;
        components += childStats.components;
        frames += childStats.frames;
        text += childStats.text;
      }
    }

    return { total, components, frames, text };
  }

  /**
   * Figma 컴포넌트와 디자인 시스템 컴포넌트 간의 매핑 제안
   */
  private suggestComponentMappings(figmaComponents: string[]): Array<{
    figmaComponent: string;
    designSystemComponent: string;
    confidence: number;
  }> {
    const mappings: Array<{
      figmaComponent: string;
      designSystemComponent: string;
      confidence: number;
    }> = [];

    // 일반적인 컴포넌트 이름 매핑
    const commonMappings: Record<string, string[]> = {
      'button': ['Button', 'Btn', 'PrimaryButton', 'SecondaryButton'],
      'input': ['Input', 'TextField', 'TextInput'],
      'card': ['Card', 'Panel', 'Container'],
      'modal': ['Modal', 'Dialog', 'Popup'],
      'header': ['Header', 'Navbar', 'Navigation'],
      'footer': ['Footer', 'BottomBar'],
      'sidebar': ['Sidebar', 'Drawer', 'Navigation'],
      'form': ['Form', 'FormGroup'],
      'table': ['Table', 'DataTable'],
      'list': ['List', 'ListItem'],
      'avatar': ['Avatar', 'ProfileImage'],
      'badge': ['Badge', 'Tag', 'Label'],
      'tooltip': ['Tooltip', 'Popover'],
      'dropdown': ['Dropdown', 'Select'],
      'checkbox': ['Checkbox', 'CheckBox'],
      'radio': ['Radio', 'RadioButton'],
      'switch': ['Switch', 'Toggle'],
      'slider': ['Slider', 'Range'],
      'progress': ['Progress', 'ProgressBar'],
      'spinner': ['Spinner', 'Loader'],
      'alert': ['Alert', 'Notification'],
      'breadcrumb': ['Breadcrumb', 'Breadcrumbs'],
      'pagination': ['Pagination', 'Pager'],
      'tabs': ['Tabs', 'TabList'],
      'accordion': ['Accordion', 'Collapse'],
      'carousel': ['Carousel', 'Slider'],
      'stepper': ['Stepper', 'Steps'],
    };

    for (const figmaComponent of figmaComponents) {
      const lowerName = figmaComponent.toLowerCase();
      
      for (const [key, possibleNames] of Object.entries(commonMappings)) {
        for (const possibleName of possibleNames) {
          if (lowerName.includes(key) || lowerName.includes(possibleName.toLowerCase())) {
            mappings.push({
              figmaComponent,
              designSystemComponent: possibleName,
              confidence: 0.8,
            });
            break;
          }
        }
      }
    }

    return mappings;
  }

  /**
   * 분석 결과 표시 형식 지정
   */
  private formatAnalysis(analysis: FigmaAnalysis): string {
    let result = `## Figma File Analysis\n\n`;
    result += `**File Statistics:**\n`;
    result += `- Total Nodes: ${analysis.totalNodes}\n`;
    result += `- Components: ${analysis.componentCount}\n`;
    result += `- Frames: ${analysis.frameCount}\n`;
    result += `- Text Elements: ${analysis.textCount}\n\n`;

    if (analysis.availableComponents.length > 0) {
      result += `**Available Components:**\n`;
      analysis.availableComponents.forEach(comp => {
        result += `- ${comp}\n`;
      });
      result += `\n`;
    }

    if (analysis.suggestedMappings.length > 0) {
      result += `**Suggested Component Mappings:**\n`;
      analysis.suggestedMappings.forEach(mapping => {
        result += `- ${mapping.figmaComponent} → ${mapping.designSystemComponent} (${Math.round(mapping.confidence * 100)}% confidence)\n`;
      });
    }

    return result;
  }

  /**
   * Figma 파일에서 디자인 토큰 추출
   */
  extractDesignTokens(file: FigmaFile): Record<string, any> {
    const tokens: Record<string, any> = {
      colors: {},
      typography: {},
      spacing: {},
      borderRadius: {},
    };

    // 스타일에서 색상 추출
    for (const [key, style] of Object.entries(file.styles)) {
      if (style.styleType === 'FILL') {
        tokens.colors[key] = style.description || key;
      }
    }

    // 타이포그래피 추출
    for (const [key, style] of Object.entries(file.styles)) {
      if (style.styleType === 'TEXT') {
        tokens.typography[key] = {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
        };
      }
    }

    return tokens;
  }
}
