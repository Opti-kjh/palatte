/**
 * TypeScript AST 분석기
 * React/Vue 컴포넌트 소스 코드에서 Props 정보를 추출합니다.
 */

import ts from 'typescript';
import type { ComponentProp, ComponentExample } from '../services/design-system.js';

export interface AnalyzedComponent {
  name: string;
  description: string;
  props: ComponentProp[];
  examples: ComponentExample[];
}

/**
 * TypeScript Compiler API를 사용하여 컴포넌트를 분석합니다.
 */
export class TypeScriptAnalyzer {
  /**
   * React 컴포넌트 소스 코드 분석
   */
  analyzeReactComponent(
    sourceCode: string,
    componentDir: string
  ): AnalyzedComponent | null {
    try {
      const sourceFile = ts.createSourceFile(
        'component.tsx',
        sourceCode,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      );

      const componentName = this.toPascalCase(componentDir);
      const description = this.extractJSDocDescription(sourceFile) ||
        `${componentName} component`;
      const props = this.extractPropsFromReact(sourceFile, componentName);
      const examples = this.extractExamples(sourceFile, componentName);

      return {
        name: componentName,
        description,
        props,
        examples,
      };
    } catch (error) {
      console.warn(`React 컴포넌트 분석 실패 (${componentDir}):`, error);
      return null;
    }
  }

  /**
   * Vue 컴포넌트 소스 코드 분석 (script 섹션만)
   */
  analyzeVueComponent(
    sourceCode: string,
    componentDir: string
  ): AnalyzedComponent | null {
    try {
      // Vue SFC에서 script 블록 추출
      const scriptContent = this.extractVueScript(sourceCode);
      if (!scriptContent) {
        return this.createBasicComponent(componentDir, 'vue');
      }

      const sourceFile = ts.createSourceFile(
        'component.ts',
        scriptContent,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
      );

      const componentName = this.toVueComponentName(componentDir);
      const description = this.extractJSDocDescription(sourceFile) ||
        `${componentName} component`;
      const props = this.extractPropsFromVue(sourceFile);
      const examples = this.extractExamples(sourceFile, componentName);

      return {
        name: componentName,
        description,
        props,
        examples,
      };
    } catch (error) {
      console.warn(`Vue 컴포넌트 분석 실패 (${componentDir}):`, error);
      return this.createBasicComponent(componentDir, 'vue');
    }
  }

  /**
   * React Props 인터페이스에서 props 추출
   */
  private extractPropsFromReact(
    sourceFile: ts.SourceFile,
    componentName: string
  ): ComponentProp[] {
    const props: ComponentProp[] = [];
    // ssm-web의 다양한 Props 패턴 지원
    // - SsmButtonProps (표준)
    // - AccordionProps (base 폴더)
    // - SsmRadioGroupProps (그룹 컴포넌트)
    // - SsmIconProps (types.ts)
    const propsInterfaceNames = [
      `${componentName}Props`,              // ButtonProps
      `Ssm${componentName}Props`,           // SsmButtonProps
      `Props`,                               // Props
      `${componentName}PropsType`,          // ButtonPropsType
      `Ssm${componentName}PropsType`,       // SsmButtonPropsType
      `Ssm${componentName}GroupProps`,      // SsmRadioGroupProps
      `${componentName}GroupProps`,         // RadioGroupProps
    ];

    // 타입 참조를 해결하기 위한 타입 정의 맵
    const typeDefinitions = new Map<string, ts.TypeNode>();

    // 먼저 모든 타입 정의를 수집
    const collectTypes = (node: ts.Node) => {
      if (ts.isTypeAliasDeclaration(node)) {
        typeDefinitions.set(node.name.text, node.type);
      }
      if (ts.isInterfaceDeclaration(node)) {
        // 인터페이스도 기록 (나중에 멤버 추출에 사용)
      }
      ts.forEachChild(node, collectTypes);
    };
    collectTypes(sourceFile);

    const visit = (node: ts.Node) => {
      // interface Props { ... } 형태
      if (ts.isInterfaceDeclaration(node)) {
        const name = node.name.text;
        if (propsInterfaceNames.includes(name)) {
          node.members.forEach((member) => {
            const prop = this.extractPropFromMember(member);
            if (prop) {
              props.push(prop);
            }
          });
        }
      }

      // type Props = { ... } 형태
      if (ts.isTypeAliasDeclaration(node)) {
        const name = node.name.text;
        if (propsInterfaceNames.includes(name)) {
          this.extractPropsFromTypeNodeWithRefs(node.type, props, typeDefinitions);
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    // 중복 props 제거 (union 타입에서 발생)
    const uniqueProps = this.deduplicateProps(props);
    return uniqueProps;
  }

  /**
   * 중복 props 제거 (같은 이름의 props는 첫 번째만 유지)
   */
  private deduplicateProps(props: ComponentProp[]): ComponentProp[] {
    const seen = new Set<string>();
    const result: ComponentProp[] = [];

    for (const prop of props) {
      if (!seen.has(prop.name)) {
        seen.add(prop.name);
        result.push(prop);
      }
    }

    return result;
  }

  /**
   * Vue defineProps에서 props 추출
   */
  private extractPropsFromVue(sourceFile: ts.SourceFile): ComponentProp[] {
    const props: ComponentProp[] = [];

    // 타입 참조를 해결하기 위한 타입 정의 맵
    const typeDefinitions = new Map<string, ts.TypeNode>();
    const interfaceDefinitions = new Map<string, ts.InterfaceDeclaration>();

    // 먼저 모든 타입/인터페이스 정의를 수집
    const collectTypes = (node: ts.Node) => {
      if (ts.isTypeAliasDeclaration(node)) {
        typeDefinitions.set(node.name.text, node.type);
      }
      if (ts.isInterfaceDeclaration(node)) {
        interfaceDefinitions.set(node.name.text, node);
      }
      ts.forEachChild(node, collectTypes);
    };
    collectTypes(sourceFile);

    const visit = (node: ts.Node) => {
      // defineProps<{ ... }>() 또는 defineProps<PropsInterface>() 형태
      if (ts.isCallExpression(node)) {
        const expression = node.expression;
        if (ts.isIdentifier(expression) && expression.text === 'defineProps') {
          // 타입 인자에서 props 추출
          if (node.typeArguments && node.typeArguments.length > 0) {
            const typeArg = node.typeArguments[0];

            // 직접 타입 리터럴인 경우
            if (ts.isTypeLiteralNode(typeArg)) {
              typeArg.members.forEach((member) => {
                const prop = this.extractPropFromMember(member);
                if (prop) {
                  props.push(prop);
                }
              });
            }
            // 타입 참조인 경우 (defineProps<SsmButtonProps>())
            else if (ts.isTypeReferenceNode(typeArg)) {
              const typeName = typeArg.typeName.getText();
              // 인터페이스 찾기
              const iface = interfaceDefinitions.get(typeName);
              if (iface) {
                iface.members.forEach((member) => {
                  const prop = this.extractPropFromMember(member);
                  if (prop) {
                    props.push(prop);
                  }
                });
              }
              // 타입 별칭 찾기
              const typeAlias = typeDefinitions.get(typeName);
              if (typeAlias) {
                this.extractPropsFromTypeNodeWithRefs(typeAlias, props, typeDefinitions);
              }
            }
          }

          // 객체 인자에서 props 추출
          if (node.arguments.length > 0) {
            const arg = node.arguments[0];
            if (ts.isObjectLiteralExpression(arg)) {
              arg.properties.forEach((property) => {
                if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
                  const propName = property.name.text;
                  const prop = this.extractPropFromVueDefinition(propName, property.initializer);
                  if (prop) {
                    props.push(prop);
                  }
                }
              });
            }
          }
        }
      }

      // withDefaults(defineProps<...>(), { ... }) 형태도 처리
      if (ts.isCallExpression(node)) {
        const expression = node.expression;
        if (ts.isIdentifier(expression) && expression.text === 'withDefaults') {
          if (node.arguments.length > 0) {
            const definePropsCall = node.arguments[0];
            if (ts.isCallExpression(definePropsCall)) {
              // defineProps의 타입 인자 처리
              if (definePropsCall.typeArguments && definePropsCall.typeArguments.length > 0) {
                const typeArg = definePropsCall.typeArguments[0];

                if (ts.isTypeLiteralNode(typeArg)) {
                  typeArg.members.forEach((member) => {
                    const prop = this.extractPropFromMember(member);
                    if (prop) {
                      props.push(prop);
                    }
                  });
                } else if (ts.isTypeReferenceNode(typeArg)) {
                  const typeName = typeArg.typeName.getText();
                  const iface = interfaceDefinitions.get(typeName);
                  if (iface) {
                    iface.members.forEach((member) => {
                      const prop = this.extractPropFromMember(member);
                      if (prop) {
                        props.push(prop);
                      }
                    });
                  }
                  const typeAlias = typeDefinitions.get(typeName);
                  if (typeAlias) {
                    this.extractPropsFromTypeNodeWithRefs(typeAlias, props, typeDefinitions);
                  }
                }
              }
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return this.deduplicateProps(props);
  }

  /**
   * 타입 노드에서 props 추출 (타입 참조 해결 지원)
   */
  private extractPropsFromTypeNodeWithRefs(
    typeNode: ts.TypeNode,
    props: ComponentProp[],
    typeDefinitions: Map<string, ts.TypeNode>,
    visited: Set<string> = new Set()
  ): void {
    // { ... } 형태의 타입 리터럴
    if (ts.isTypeLiteralNode(typeNode)) {
      typeNode.members.forEach((member) => {
        const prop = this.extractPropFromMember(member);
        if (prop) {
          props.push(prop);
        }
      });
      return;
    }

    // A & B 형태의 intersection 타입
    if (ts.isIntersectionTypeNode(typeNode)) {
      typeNode.types.forEach((type) => {
        this.extractPropsFromTypeNodeWithRefs(type, props, typeDefinitions, visited);
      });
      return;
    }

    // A | B 형태의 union 타입 (각 분기에서 props 추출)
    if (ts.isUnionTypeNode(typeNode)) {
      typeNode.types.forEach((type) => {
        this.extractPropsFromTypeNodeWithRefs(type, props, typeDefinitions, visited);
      });
      return;
    }

    // 괄호로 감싸진 타입: (A | B)
    if (ts.isParenthesizedTypeNode(typeNode)) {
      this.extractPropsFromTypeNodeWithRefs(typeNode.type, props, typeDefinitions, visited);
      return;
    }

    // 타입 참조 (ConditionalProps 등)
    if (ts.isTypeReferenceNode(typeNode)) {
      const typeName = typeNode.typeName.getText();

      // Omit, Pick, Partial 등의 유틸리티 타입은 건너뛰기
      if (['Omit', 'Pick', 'Partial', 'Required', 'Readonly', 'Record'].includes(typeName)) {
        return;
      }

      // 순환 참조 방지
      if (visited.has(typeName)) {
        return;
      }
      visited.add(typeName);

      // 같은 파일에 정의된 타입 찾기
      const referencedType = typeDefinitions.get(typeName);
      if (referencedType) {
        this.extractPropsFromTypeNodeWithRefs(referencedType, props, typeDefinitions, visited);
      }
      return;
    }
  }

  /**
   * 타입 노드에서 props 추출 (intersection, union, literal 타입 지원)
   * @deprecated Use extractPropsFromTypeNodeWithRefs instead
   */
  private extractPropsFromTypeNode(typeNode: ts.TypeNode, props: ComponentProp[]): void {
    this.extractPropsFromTypeNodeWithRefs(typeNode, props, new Map());
  }

  /**
   * 인터페이스/타입 멤버에서 prop 정보 추출
   */
  private extractPropFromMember(member: ts.TypeElement): ComponentProp | null {
    if (!ts.isPropertySignature(member)) {
      return null;
    }

    const name = member.name && ts.isIdentifier(member.name)
      ? member.name.text
      : null;

    if (!name) {
      return null;
    }

    const type = member.type ? this.typeToString(member.type) : 'unknown';
    const required = !member.questionToken;
    const description = this.extractJSDocFromNode(member) || `${name} property`;
    const defaultValue = this.extractDefaultValue(member);

    return {
      name,
      type,
      required,
      description,
      ...(defaultValue !== undefined && { defaultValue }),
    };
  }

  /**
   * Vue props 정의에서 prop 정보 추출
   */
  private extractPropFromVueDefinition(
    name: string,
    initializer: ts.Expression
  ): ComponentProp | null {
    let type = 'unknown';
    let required = false;
    let defaultValue: string | undefined;

    if (ts.isObjectLiteralExpression(initializer)) {
      initializer.properties.forEach((prop) => {
        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
          const propName = prop.name.text;
          if (propName === 'type') {
            type = prop.initializer.getText();
          } else if (propName === 'required') {
            // TrueKeyword 또는 FalseKeyword 확인
            required = prop.initializer.kind === ts.SyntaxKind.TrueKeyword;
          } else if (propName === 'default') {
            defaultValue = prop.initializer.getText();
          }
        }
      });
    } else if (ts.isIdentifier(initializer)) {
      // String, Number, Boolean 등
      type = initializer.text.toLowerCase();
    }

    return {
      name,
      type,
      required,
      description: `${name} property`,
      ...(defaultValue !== undefined && { defaultValue }),
    };
  }

  /**
   * Vue SFC에서 script 섹션 추출
   */
  private extractVueScript(sourceCode: string): string | null {
    // <script setup lang="ts"> ... </script> 또는 <script lang="ts"> ... </script>
    const scriptRegex = /<script[^>]*(?:setup)?[^>]*>[\s\S]*?<\/script>/gi;
    const matches = sourceCode.match(scriptRegex);

    if (!matches || matches.length === 0) {
      return null;
    }

    // setup script 우선
    const setupMatch = matches.find((m) => m.includes('setup'));
    const targetScript = setupMatch || matches[0];

    // 태그 제거
    return targetScript
      .replace(/<script[^>]*>/, '')
      .replace(/<\/script>/, '')
      .trim();
  }

  /**
   * 파일 레벨 JSDoc에서 설명 추출
   */
  private extractJSDocDescription(sourceFile: ts.SourceFile): string | null {
    const firstStatement = sourceFile.statements[0];
    if (!firstStatement) return null;

    const jsDoc = ts.getJSDocTags(firstStatement);
    const descriptionTag = jsDoc.find(
      (tag) => tag.tagName.text === 'description' || tag.tagName.text === 'desc'
    );

    if (descriptionTag && typeof descriptionTag.comment === 'string') {
      return descriptionTag.comment;
    }

    // 일반 JSDoc 코멘트
    const comments = ts.getLeadingCommentRanges(sourceFile.text, firstStatement.pos);
    if (comments && comments.length > 0) {
      const comment = sourceFile.text.slice(comments[0].pos, comments[0].end);
      const match = comment.match(/\/\*\*[\s\S]*?\*\//);
      if (match) {
        const description = match[0]
          .replace(/\/\*\*|\*\//g, '')
          .replace(/^\s*\*\s?/gm, '')
          .trim()
          .split('\n')[0];
        return description || null;
      }
    }

    return null;
  }

  /**
   * 노드의 JSDoc 코멘트 추출
   */
  private extractJSDocFromNode(node: ts.Node): string | null {
    const jsDocComments = (node as any).jsDoc;
    if (jsDocComments && jsDocComments.length > 0) {
      const comment = jsDocComments[0].comment;
      return typeof comment === 'string' ? comment : null;
    }
    return null;
  }

  /**
   * 기본값 추출
   */
  private extractDefaultValue(member: ts.PropertySignature): string | undefined {
    // JSDoc @default 태그에서 추출
    const jsDocTags = ts.getJSDocTags(member);
    const defaultTag = jsDocTags.find((tag) => tag.tagName.text === 'default');
    if (defaultTag && typeof defaultTag.comment === 'string') {
      return defaultTag.comment;
    }
    return undefined;
  }

  /**
   * 타입을 문자열로 변환
   */
  private typeToString(type: ts.TypeNode): string {
    if (ts.isUnionTypeNode(type)) {
      return type.types.map((t) => this.typeToString(t)).join(' | ');
    }

    if (ts.isLiteralTypeNode(type)) {
      if (ts.isStringLiteral(type.literal)) {
        return `'${type.literal.text}'`;
      }
      return type.literal.getText();
    }

    if (ts.isArrayTypeNode(type)) {
      return `${this.typeToString(type.elementType)}[]`;
    }

    if (ts.isTypeReferenceNode(type)) {
      const name = type.typeName.getText();
      if (type.typeArguments) {
        const args = type.typeArguments.map((t) => this.typeToString(t)).join(', ');
        return `${name}<${args}>`;
      }
      return name;
    }

    if (ts.isFunctionTypeNode(type)) {
      const params = type.parameters
        .map((p) => {
          const paramName = p.name.getText();
          const paramType = p.type ? this.typeToString(p.type) : 'any';
          return `${paramName}: ${paramType}`;
        })
        .join(', ');
      const returnType = type.type ? this.typeToString(type.type) : 'void';
      return `(${params}) => ${returnType}`;
    }

    return type.getText();
  }

  /**
   * 예제 추출 (JSDoc @example 태그에서)
   */
  private extractExamples(
    sourceFile: ts.SourceFile,
    componentName: string
  ): ComponentExample[] {
    const examples: ComponentExample[] = [];

    const visit = (node: ts.Node) => {
      const jsDocTags = ts.getJSDocTags(node);
      const exampleTags = jsDocTags.filter((tag) => tag.tagName.text === 'example');

      exampleTags.forEach((tag, index) => {
        if (typeof tag.comment === 'string') {
          examples.push({
            name: `Example ${index + 1}`,
            code: tag.comment.trim(),
            description: `Usage example for ${componentName}`,
          });
        }
      });

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    // 예제가 없으면 기본 예제 생성
    if (examples.length === 0) {
      examples.push({
        name: `Basic ${componentName}`,
        code: `<${componentName} />`,
        description: `Basic ${componentName} usage`,
      });
    }

    return examples;
  }

  /**
   * 기본 컴포넌트 정보 생성 (분석 실패 시)
   */
  private createBasicComponent(
    componentDir: string,
    framework: 'react' | 'vue'
  ): AnalyzedComponent {
    const name = framework === 'vue'
      ? this.toVueComponentName(componentDir)
      : this.toPascalCase(componentDir);

    return {
      name,
      description: `${name} component`,
      props: [],
      examples: [
        {
          name: `Basic ${name}`,
          code: `<${name} />`,
          description: `Basic ${name} usage`,
        },
      ],
    };
  }

  /**
   * kebab-case를 PascalCase로 변환
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/^ssm-/, '') // ssm- 접두사 제거
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  /**
   * Vue 컴포넌트 이름으로 변환 (Ssm 접두사 유지)
   */
  private toVueComponentName(str: string): string {
    return str
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
}
