export interface DesignSystemComponent {
  name: string;
  description: string;
  category: string;
  props: ComponentProp[];
  examples: ComponentExample[];
  importPath: string;
  dependencies?: string[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface ComponentExample {
  name: string;
  code: string;
  description: string;
}

export class DesignSystemService {
  private reactComponents: DesignSystemComponent[] = [];
  private vueComponents: DesignSystemComponent[] = [];

  constructor() {
    this.initializeComponents();
  }

  /**
   * Initialize available components from the design system
   */
  private initializeComponents(): void {
    // React Design System Components
    this.reactComponents = [
      {
        name: 'Button',
        description: 'Primary button component with multiple variants',
        category: 'Actions',
        importPath: 'design-system-react/Button',
        props: [
          {
            name: 'variant',
            type: "'primary' | 'secondary' | 'tertiary' | 'danger'",
            required: false,
            defaultValue: "'primary'",
            description: 'Button variant style',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Button size',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the button is disabled',
          },
          {
            name: 'loading',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the button is in loading state',
          },
          {
            name: 'onClick',
            type: '() => void',
            required: false,
            description: 'Click handler function',
          },
        ],
        examples: [
          {
            name: 'Basic Button',
            code: '<Button>Click me</Button>',
            description: 'Basic button usage',
          },
          {
            name: 'Primary Button',
            code: '<Button variant="primary">Primary</Button>',
            description: 'Primary variant button',
          },
          {
            name: 'Loading Button',
            code: '<Button loading>Loading...</Button>',
            description: 'Button in loading state',
          },
        ],
      },
      {
        name: 'Input',
        description: 'Text input component with validation support',
        category: 'Forms',
        importPath: 'design-system-react/Input',
        props: [
          {
            name: 'type',
            type: "'text' | 'email' | 'password' | 'number'",
            required: false,
            defaultValue: "'text'",
            description: 'Input type',
          },
          {
            name: 'placeholder',
            type: 'string',
            required: false,
            description: 'Placeholder text',
          },
          {
            name: 'value',
            type: 'string',
            required: false,
            description: 'Input value',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the input is disabled',
          },
          {
            name: 'error',
            type: 'string',
            required: false,
            description: 'Error message to display',
          },
          {
            name: 'onChange',
            type: '(value: string) => void',
            required: false,
            description: 'Change handler function',
          },
        ],
        examples: [
          {
            name: 'Basic Input',
            code: '<Input placeholder="Enter text" />',
            description: 'Basic input field',
          },
          {
            name: 'Input with Error',
            code: '<Input error="This field is required" />',
            description: 'Input with error state',
          },
        ],
      },
      {
        name: 'Card',
        description: 'Card container component for content grouping',
        category: 'Layout',
        importPath: 'design-system-react/Card',
        props: [
          {
            name: 'title',
            type: 'string',
            required: false,
            description: 'Card title',
          },
          {
            name: 'subtitle',
            type: 'string',
            required: false,
            description: 'Card subtitle',
          },
          {
            name: 'elevation',
            type: 'number',
            required: false,
            defaultValue: '1',
            description: 'Card elevation level (0-3)',
          },
          {
            name: 'padding',
            type: "'none' | 'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Card padding size',
          },
        ],
        examples: [
          {
            name: 'Basic Card',
            code: '<Card title="Card Title">Card content</Card>',
            description: 'Basic card with title',
          },
          {
            name: 'Card with Elevation',
            code: '<Card elevation={2}>Elevated card</Card>',
            description: 'Card with custom elevation',
          },
        ],
      },
      {
        name: 'Modal',
        description: 'Modal dialog component for overlays',
        category: 'Overlays',
        importPath: 'design-system-react/Modal',
        props: [
          {
            name: 'isOpen',
            type: 'boolean',
            required: true,
            description: 'Whether the modal is open',
          },
          {
            name: 'onClose',
            type: '() => void',
            required: true,
            description: 'Function to close the modal',
          },
          {
            name: 'title',
            type: 'string',
            required: false,
            description: 'Modal title',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large' | 'fullscreen'",
            required: false,
            defaultValue: "'medium'",
            description: 'Modal size',
          },
        ],
        examples: [
          {
            name: 'Basic Modal',
            code: '<Modal isOpen={isOpen} onClose={handleClose} title="Modal Title">Modal content</Modal>',
            description: 'Basic modal usage',
          },
        ],
      },
      {
        name: 'Table',
        description: 'Data table component with sorting and pagination',
        category: 'Data Display',
        importPath: 'design-system-react/Table',
        props: [
          {
            name: 'data',
            type: 'Array<any>',
            required: true,
            description: 'Table data array',
          },
          {
            name: 'columns',
            type: 'Array<Column>',
            required: true,
            description: 'Table column definitions',
          },
          {
            name: 'sortable',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether columns are sortable',
          },
          {
            name: 'pagination',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether to show pagination',
          },
        ],
        examples: [
          {
            name: 'Basic Table',
            code: '<Table data={data} columns={columns} />',
            description: 'Basic table with data',
          },
        ],
      },
    ];

    // Vue Design System Components
    this.vueComponents = [
      {
        name: 'Button',
        description: 'Primary button component with multiple variants',
        category: 'Actions',
        importPath: 'design-system/Button',
        props: [
          {
            name: 'variant',
            type: "'primary' | 'secondary' | 'tertiary' | 'danger'",
            required: false,
            defaultValue: "'primary'",
            description: 'Button variant style',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Button size',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the button is disabled',
          },
          {
            name: 'loading',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the button is in loading state',
          },
        ],
        examples: [
          {
            name: 'Basic Button',
            code: '<Button>Click me</Button>',
            description: 'Basic button usage',
          },
          {
            name: 'Primary Button',
            code: '<Button variant="primary">Primary</Button>',
            description: 'Primary variant button',
          },
        ],
      },
      {
        name: 'Input',
        description: 'Text input component with validation support',
        category: 'Forms',
        importPath: 'design-system/Input',
        props: [
          {
            name: 'type',
            type: "'text' | 'email' | 'password' | 'number'",
            required: false,
            defaultValue: "'text'",
            description: 'Input type',
          },
          {
            name: 'placeholder',
            type: 'string',
            required: false,
            description: 'Placeholder text',
          },
          {
            name: 'modelValue',
            type: 'string',
            required: false,
            description: 'Input value (v-model)',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the input is disabled',
          },
          {
            name: 'error',
            type: 'string',
            required: false,
            description: 'Error message to display',
          },
        ],
        examples: [
          {
            name: 'Basic Input',
            code: '<Input placeholder="Enter text" v-model="value" />',
            description: 'Basic input field with v-model',
          },
          {
            name: 'Input with Error',
            code: '<Input error="This field is required" />',
            description: 'Input with error state',
          },
        ],
      },
      {
        name: 'Card',
        description: 'Card container component for content grouping',
        category: 'Layout',
        importPath: 'design-system/Card',
        props: [
          {
            name: 'title',
            type: 'string',
            required: false,
            description: 'Card title',
          },
          {
            name: 'subtitle',
            type: 'string',
            required: false,
            description: 'Card subtitle',
          },
          {
            name: 'elevation',
            type: 'number',
            required: false,
            defaultValue: '1',
            description: 'Card elevation level (0-3)',
          },
          {
            name: 'padding',
            type: "'none' | 'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Card padding size',
          },
        ],
        examples: [
          {
            name: 'Basic Card',
            code: '<Card title="Card Title">Card content</Card>',
            description: 'Basic card with title',
          },
        ],
      },
    ];
  }

  /**
   * Get available components for a specific framework
   */
  async getAvailableComponents(framework: 'react' | 'vue'): Promise<DesignSystemComponent[]> {
    return framework === 'react' ? this.reactComponents : this.vueComponents;
  }

  /**
   * Find the best matching component for a Figma component
   */
  findBestMatch(figmaComponentName: string, framework: 'react' | 'vue'): DesignSystemComponent | null {
    const components = framework === 'react' ? this.reactComponents : this.vueComponents;
    
    // Direct name match
    const directMatch = components.find(comp => 
      comp.name.toLowerCase() === figmaComponentName.toLowerCase()
    );
    if (directMatch) return directMatch;

    // Fuzzy matching based on common patterns
    const lowerName = figmaComponentName.toLowerCase();
    
    for (const component of components) {
      const componentName = component.name.toLowerCase();
      
      // Check if the component name is contained in the figma name or vice versa
      if (lowerName.includes(componentName) || componentName.includes(lowerName)) {
        return component;
      }
      
      // Check for common variations
      const variations = [
        componentName + 's', // plural
        componentName.replace('button', 'btn'),
        componentName.replace('input', 'field'),
        componentName.replace('card', 'panel'),
      ];
      
      for (const variation of variations) {
        if (lowerName.includes(variation) || variation.includes(lowerName)) {
          return component;
        }
      }
    }

    return null;
  }

  /**
   * Get component by name
   */
  getComponent(name: string, framework: 'react' | 'vue'): DesignSystemComponent | null {
    const components = framework === 'react' ? this.reactComponents : this.vueComponents;
    return components.find(comp => comp.name === name) || null;
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: string, framework: 'react' | 'vue'): DesignSystemComponent[] {
    const components = framework === 'react' ? this.reactComponents : this.vueComponents;
    return components.filter(comp => comp.category === category);
  }

  /**
   * Get all available categories
   */
  getCategories(framework: 'react' | 'vue'): string[] {
    const components = framework === 'react' ? this.reactComponents : this.vueComponents;
    const categories = new Set(components.map(comp => comp.category));
    return Array.from(categories);
  }
}
