import { FigmaFile, FigmaNode } from './figma.js';
import { DesignSystemService, DesignSystemComponent } from './design-system.js';

export interface GeneratedComponent {
  name: string;
  code: string;
  imports: string[];
  dependencies: string[];
}

export class CodeGenerator {
  constructor(private designSystemService: DesignSystemService) {}

  /**
   * Generate React component from Figma data
   */
  async generateReactComponent(
    figmaData: FigmaFile,
    componentName: string
  ): Promise<string> {
    const imports = new Set<string>();
    const dependencies = new Set<string>();
    let componentCode = '';

    // Analyze Figma structure and map to design system components
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

    // Generate component structure
    componentCode += this.generateReactComponentStructure(
      componentName,
      figmaData.document,
      mappedComponents
    );

    // Add imports at the top
    const importsCode = Array.from(imports).join('\n');
    const dependenciesCode = Array.from(dependencies).length > 0 
      ? `\n// Dependencies: ${Array.from(dependencies).join(', ')}` 
      : '';

    // Add GitHub repository information
    const repositoryInfo = `// Design System Components from GitHub:
// React: https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system-react
// Vue: https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system
// 
// To use these components, install the packages:
// npm install design-system-react design-system
// or
// yarn add design-system-react design-system
`;

    return `${repositoryInfo}\n${importsCode}${dependenciesCode}\n\n${componentCode}`;
  }

  /**
   * Generate Vue component from Figma data
   */
  async generateVueComponent(
    figmaData: FigmaFile,
    componentName: string
  ): Promise<string> {
    const imports = new Set<string>();
    const dependencies = new Set<string>();
    let componentCode = '';

    // Analyze Figma structure and map to design system components
    const mappedComponents = this.mapFigmaToDesignSystem(figmaData.document, 'vue');
    
    // Generate imports
    for (const mapping of mappedComponents) {
      if (mapping.designSystemComponent) {
        imports.add(`import { ${mapping.designSystemComponent.name} } from '${mapping.designSystemComponent.importPath}';`);
        if (mapping.designSystemComponent.dependencies) {
          mapping.designSystemComponent.dependencies.forEach(dep => dependencies.add(dep));
        }
      }
    }

    // Generate component structure
    componentCode += this.generateVueComponentStructure(
      componentName,
      figmaData.document,
      mappedComponents
    );

    // Add imports at the top
    const importsCode = Array.from(imports).join('\n');
    const dependenciesCode = Array.from(dependencies).length > 0 
      ? `\n// Dependencies: ${Array.from(dependencies).join(', ')}` 
      : '';

    return `${importsCode}${dependenciesCode}\n\n${componentCode}`;
  }

  /**
   * Map Figma nodes to design system components
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

    // Analyze current node
    const mapping = this.analyzeNode(node, framework);
    mappings.push(mapping);

    // Recursively analyze children
    if (node.children) {
      for (const child of node.children) {
        mappings.push(...this.mapFigmaToDesignSystem(child, framework));
      }
    }

    return mappings;
  }

  /**
   * Analyze a single Figma node and find best design system match
   * ALWAYS returns a Design System component - never null
   */
  private analyzeNode(
    node: FigmaNode,
    framework: 'react' | 'vue'
  ): {
    figmaNode: FigmaNode;
    designSystemComponent: DesignSystemComponent;
    confidence: number;
  } {
    // Skip invisible nodes
    if (node.visible === false) {
      const defaultComponent = this.designSystemService.getComponent('Card', framework);
      if (!defaultComponent) {
        // This should never happen as Card is always available
        throw new Error('No Design System components available');
      }
      return {
        figmaNode: node,
        designSystemComponent: defaultComponent,
        confidence: 0.1,
      };
    }

    // Try to find a matching component based on node properties
    let component = this.findComponentByNodeProperties(node, framework);
    
    // If no match found, use default component based on node type
    if (!component) {
      component = this.getDefaultComponentByType(node, framework);
    }
    
    return {
      figmaNode: node,
      designSystemComponent: component,
      confidence: 0.8,
    };
  }

  /**
   * Find design system component based on Figma node properties
   * Enhanced matching with more patterns
   */
  private findComponentByNodeProperties(
    node: FigmaNode,
    framework: 'react' | 'vue'
  ): DesignSystemComponent | null {
    const nodeName = node.name.toLowerCase();
    const nodeType = node.type;

    // 1. Direct name matching
    let component = this.designSystemService.findBestMatch(nodeName, framework);
    if (component) return component;

    // 2. Enhanced pattern matching
    const enhancedMappings = [
      { patterns: ['btn', 'button', 'click', 'submit', 'action'], component: 'Button' },
      { patterns: ['input', 'field', 'text', 'search', 'email'], component: 'Input' },
      { patterns: ['card', 'panel', 'container', 'box', 'wrapper'], component: 'Card' },
      { patterns: ['modal', 'dialog', 'popup', 'overlay'], component: 'Modal' },
      { patterns: ['table', 'grid', 'list', 'data'], component: 'Table' },
    ];

    for (const mapping of enhancedMappings) {
      if (mapping.patterns.some(pattern => nodeName.includes(pattern))) {
        const foundComponent = this.designSystemService.getComponent(mapping.component, framework);
        if (foundComponent) return foundComponent;
      }
    }

    // 3. Type-based matching with enhanced logic
    switch (nodeType) {
      case 'TEXT':
        // Text nodes - check if they're button labels
        if (nodeName.includes('button') || nodeName.includes('btn') || nodeName.includes('click')) {
          return this.designSystemService.getComponent('Button', framework);
        }
        // Default text to Card for content
        return this.designSystemService.getComponent('Card', framework);
        
      case 'FRAME':
        // Frames - enhanced matching
        if (nodeName.includes('card') || nodeName.includes('panel') || nodeName.includes('container')) {
          return this.designSystemService.getComponent('Card', framework);
        }
        if (nodeName.includes('modal') || nodeName.includes('dialog') || nodeName.includes('popup')) {
          return this.designSystemService.getComponent('Modal', framework);
        }
        // Default frame to Card
        return this.designSystemService.getComponent('Card', framework);
        
      case 'COMPONENT':
        // Component instances - try enhanced matching
        component = this.designSystemService.findBestMatch(nodeName, framework);
        if (component) return component;
        // Default component to Card
        return this.designSystemService.getComponent('Card', framework);
        
      case 'RECTANGLE':
        // Rectangles - enhanced matching
        if (nodeName.includes('button') || nodeName.includes('btn') || nodeName.includes('click')) {
          return this.designSystemService.getComponent('Button', framework);
        }
        if (nodeName.includes('input') || nodeName.includes('field') || nodeName.includes('text')) {
          return this.designSystemService.getComponent('Input', framework);
        }
        if (nodeName.includes('card') || nodeName.includes('panel') || nodeName.includes('container')) {
          return this.designSystemService.getComponent('Card', framework);
        }
        // Default rectangle to Button (most common interactive element)
        return this.designSystemService.getComponent('Button', framework);
        
      default:
        // Default fallback to Card
        return this.designSystemService.getComponent('Card', framework);
    }
  }

  /**
   * Get default Design System component
   */
  private async getDefaultComponent(framework: 'react' | 'vue'): Promise<DesignSystemComponent> {
    const cardComponent = this.designSystemService.getComponent('Card', framework);
    if (cardComponent) return cardComponent;
    
    const components = await this.designSystemService.getAvailableComponents(framework);
    return components[0];
  }

  /**
   * Get default component based on node type
   */
  private getDefaultComponentByType(node: FigmaNode, framework: 'react' | 'vue'): DesignSystemComponent {
    const nodeType = node.type;
    const nodeName = node.name.toLowerCase();

    // Smart defaults based on node type and name
    switch (nodeType) {
      case 'TEXT':
        if (nodeName.includes('button') || nodeName.includes('btn') || nodeName.includes('click')) {
          const buttonComponent = this.designSystemService.getComponent('Button', framework);
          if (buttonComponent) return buttonComponent;
        }
        const cardComponent = this.designSystemService.getComponent('Card', framework);
        if (cardComponent) return cardComponent;
        break;
        
      case 'RECTANGLE':
        if (nodeName.includes('input') || nodeName.includes('field')) {
          const inputComponent = this.designSystemService.getComponent('Input', framework);
          if (inputComponent) return inputComponent;
        }
        if (nodeName.includes('button') || nodeName.includes('btn')) {
          const buttonComponent = this.designSystemService.getComponent('Button', framework);
          if (buttonComponent) return buttonComponent;
        }
        const buttonComponent2 = this.designSystemService.getComponent('Button', framework);
        if (buttonComponent2) return buttonComponent2;
        break;
        
      case 'FRAME':
        if (nodeName.includes('modal') || nodeName.includes('dialog')) {
          const modalComponent = this.designSystemService.getComponent('Modal', framework);
          if (modalComponent) return modalComponent;
        }
        const cardComponent2 = this.designSystemService.getComponent('Card', framework);
        if (cardComponent2) return cardComponent2;
        break;
        
      default:
        const defaultCardComponent = this.designSystemService.getComponent('Card', framework);
        if (defaultCardComponent) return defaultCardComponent;
        break;
    }
    
    // Final fallback - use Card as last resort
    const finalCardComponent = this.designSystemService.getComponent('Card', framework);
    if (finalCardComponent) return finalCardComponent;
    
    // This should never happen as Card is always available
    throw new Error('No Design System components available');
  }

  /**
   * Generate React component structure
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
    code += `    <div className="${this.generateClassName(rootNode)}">\n`;
    
    // Generate JSX based on mapped components
    code += this.generateReactJSX(rootNode, mappedComponents, 2);
    
    code += `    </div>\n`;
    code += `  );\n`;
    code += `};\n\n`;
    code += `export default ${componentName};\n`;
    
    return code;
  }

  /**
   * Generate Vue component structure
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
    code += `  <div class="${this.generateClassName(rootNode)}">\n`;
    
    // Generate template based on mapped components
    code += this.generateVueTemplate(rootNode, mappedComponents, 2);
    
    code += `  </div>\n`;
    code += `</template>\n\n`;
    
    code += `<script setup lang="ts">\n`;
    code += `// Add your reactive data and methods here\n`;
    code += `</script>\n\n`;
    
    code += `<style scoped>\n`;
    code += `.${this.generateClassName(rootNode)} {\n`;
    code += `  /* Add your styles here */\n`;
    code += `}\n`;
    code += `</style>\n`;
    
    return code;
  }

  /**
   * Generate React JSX from Figma nodes
   */
  private generateReactJSX(
    node: FigmaNode,
    mappedComponents: Array<{
      figmaNode: FigmaNode;
      designSystemComponent: DesignSystemComponent;
      confidence: number;
    }>,
    indent: number = 0
  ): string {
    const indentStr = '  '.repeat(indent);
    let jsx = '';

    // Find mapping for current node
    const mapping = mappedComponents.find(m => m.figmaNode.id === node.id);
    
    // ALWAYS use Design System component - never fallback to HTML
    if (mapping?.designSystemComponent) {
      const component = mapping.designSystemComponent;
      const props = this.generateComponentProps(node, component);
      jsx += `${indentStr}<${component.name}${props}>\n`;
      
      if (node.children) {
        for (const child of node.children) {
          jsx += this.generateReactJSX(child, mappedComponents, indent + 1);
        }
      } else if (node.characters) {
        jsx += `${indentStr}  ${node.characters}\n`;
      }
      
      jsx += `${indentStr}</${component.name}>\n`;
    } else {
      // This should never happen with our enhanced mapping, but if it does, use Card as fallback
      console.warn(`No Design System component found for node ${node.id}, using Card as fallback`);
      const fallbackComponent = this.designSystemService.getComponent('Card', 'react');
      if (fallbackComponent) {
        jsx += `${indentStr}<${fallbackComponent.name}>\n`;
        
        if (node.children) {
          for (const child of node.children) {
            jsx += this.generateReactJSX(child, mappedComponents, indent + 1);
          }
        } else if (node.characters) {
          jsx += `${indentStr}  ${node.characters}\n`;
        }
        
        jsx += `${indentStr}</${fallbackComponent.name}>\n`;
      }
    }

    return jsx;
  }

  /**
   * Generate Vue template from Figma nodes
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

    // Find mapping for current node
    const mapping = mappedComponents.find(m => m.figmaNode.id === node.id);
    
    // ALWAYS use Design System component - never fallback to HTML
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
      // This should never happen with our enhanced mapping, but if it does, use Card as fallback
      console.warn(`No Design System component found for node ${node.id}, using Card as fallback`);
      const fallbackComponent = this.designSystemService.getComponent('Card', 'vue');
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
   * Generate component props based on Figma node and design system component
   */
  private generateComponentProps(
    node: FigmaNode,
    component: DesignSystemComponent
  ): string {
    const props: string[] = [];

    // Add common props based on node properties
    if (node.characters && component.name === 'Button') {
      props.push(`>${node.characters}`);
    }

    if (node.characters && component.name === 'Input') {
      props.push(`placeholder="${node.characters}"`);
    }

    if (component.name === 'Card' && node.name.toLowerCase().includes('title')) {
      props.push(`title="${node.characters || node.name}"`);
    }

    // Add size props based on bounding box
    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;
      
      if (component.name === 'Button') {
        if (height < 32) props.push('size="small"');
        else if (height > 48) props.push('size="large"');
        else props.push('size="medium"');
      }
    }

    return props.length > 0 ? ` ${props.join(' ')}` : '';
  }

  /**
   * Get appropriate HTML tag name for Figma node
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
   * Generate CSS class name from Figma node
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
   * Generate inline styles from Figma node properties
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
