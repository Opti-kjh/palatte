import { ComponentSyncService, type SyncResult } from '../sync/index.js';

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

export interface SyncConfig {
  /** 서버 시작 시 자동 동기화 여부 (기본값: true) */
  autoSync?: boolean;
  /** 동기화 상세 로그 출력 여부 */
  verbose?: boolean;
}

export class DesignSystemService {
  private reactComponents: DesignSystemComponent[] = [];
  private vueComponents: DesignSystemComponent[] = [];
  private syncService: ComponentSyncService;
  private syncConfig: SyncConfig;
  private initialized: boolean = false;
  private lastSyncResult: SyncResult | null = null;

  constructor(syncConfig: SyncConfig = {}) {
    this.syncConfig = {
      autoSync: syncConfig.autoSync ?? true,
      verbose: syncConfig.verbose ?? false,
    };
    this.syncService = new ComponentSyncService();

    // 하드코딩된 기본 컴포넌트 초기화 (폴백용)
    this.initializeComponents();
  }

  /**
   * 서비스 초기화 (비동기)
   * 서버 시작 시 호출하여 GitHub에서 최신 컴포넌트 동기화
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.syncConfig.autoSync) {
      try {
        console.log('[DesignSystem] 컴포넌트 동기화 시작...');
        const result = await this.syncService.sync({
          verbose: this.syncConfig.verbose,
        });

        this.lastSyncResult = result;

        if (result.success) {
          if (result.reactComponents.length > 0) {
            this.reactComponents = result.reactComponents;
          }
          if (result.vueComponents.length > 0) {
            this.vueComponents = result.vueComponents;
          }

          console.log(
            `[DesignSystem] 동기화 완료: React ${this.reactComponents.length}개, Vue ${this.vueComponents.length}개` +
            (result.fromCache ? ' (캐시에서 로드)' : ' (GitHub에서 동기화)')
          );
        } else {
          console.warn('[DesignSystem] 동기화 실패, 하드코딩된 데이터 사용:', result.error);
        }
      } catch (error) {
        console.warn('[DesignSystem] 동기화 중 오류, 하드코딩된 데이터 사용:', error);
      }
    }

    this.initialized = true;
  }

  /**
   * 수동 동기화 실행
   */
  async syncComponents(force: boolean = false): Promise<SyncResult> {
    const result = await this.syncService.sync({
      force,
      verbose: this.syncConfig.verbose,
    });

    this.lastSyncResult = result;

    if (result.success) {
      if (result.reactComponents.length > 0) {
        this.reactComponents = result.reactComponents;
      }
      if (result.vueComponents.length > 0) {
        this.vueComponents = result.vueComponents;
      }
    }

    return result;
  }

  /**
   * 마지막 동기화 결과 조회
   */
  getLastSyncResult(): SyncResult | null {
    return this.lastSyncResult;
  }

  /**
   * 캐시 상태 조회
   */
  async getCacheStatus() {
    return this.syncService.getCacheStatus();
  }

  /**
   * 캐시 삭제
   */
  async clearCache(): Promise<void> {
    await this.syncService.clearCache();
  }

  /**
   * 디자인 시스템(React, Vue) 컴포넌트 메타데이터 제공 필요.
   * 1. 메타데이터 구조 정의
   * 2. 패키지에 manifest 추가.
   * 3. 디자인 시스템 패키지에서 export 된 컴포넌트 목록을 초기화.
   */
  private initializeComponents(): void {
    this.reactComponents = [
      {
        name: 'Accordion',
        description: 'Accordion component for collapsible content sections',
        category: 'Layout',
        importPath: '@dealicious/design-system-react/src/components/ssm-accordion',
        props: [
          {
            name: 'title',
            type: 'string',
            required: true,
            description: 'Accordion title',
          },
          {
            name: 'defaultExpanded',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the accordion is expanded by default',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the accordion is disabled',
          },
        ],
        examples: [
          {
            name: 'Basic Accordion',
            code: '<Accordion title="Section Title">Content here</Accordion>',
            description: 'Basic accordion usage',
          },
        ],
      },
      {
        name: 'ArrowPagination',
        description: 'Arrow-based pagination component',
        category: 'Navigation',
        importPath: '@dealicious/design-system-react/src/components/ssm-arrow-pagination',
        props: [
          {
            name: 'currentPage',
            type: 'number',
            required: true,
            description: 'Current page number',
          },
          {
            name: 'totalPages',
            type: 'number',
            required: true,
            description: 'Total number of pages',
          },
          {
            name: 'onPageChange',
            type: '(page: number) => void',
            required: true,
            description: 'Page change handler',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether pagination is disabled',
          },
        ],
        examples: [
          {
            name: 'Basic Arrow Pagination',
            code: '<ArrowPagination currentPage={1} totalPages={10} onPageChange={handlePageChange} />',
            description: 'Basic arrow pagination',
          },
        ],
      },
      {
        name: 'Badge',
        description: 'Badge component for status indicators',
        category: 'Data Display',
        importPath: '@dealicious/design-system-react/src/components/ssm-badge',
        props: [
          {
            name: 'variant',
            type: "'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'",
            required: false,
            defaultValue: "'primary'",
            description: 'Badge variant style',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Badge size',
          },
        ],
        examples: [
          {
            name: 'Basic Badge',
            code: '<Badge>New</Badge>',
            description: 'Basic badge usage',
          },
          {
            name: 'Success Badge',
            code: '<Badge variant="success">Completed</Badge>',
            description: 'Success variant badge',
          },
        ],
      },
      {
        name: 'Button',
        description: 'Primary button component with multiple variants',
        category: 'Actions',
        importPath: '@dealicious/design-system-react/src/components/ssm-button',
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
        name: 'Check',
        description: 'Checkbox component for form inputs',
        category: 'Forms',
        importPath: '@dealicious/design-system-react/src/components/ssm-check',
        props: [
          {
            name: 'checked',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the checkbox is checked',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the checkbox is disabled',
          },
          {
            name: 'label',
            type: 'string',
            required: false,
            description: 'Checkbox label text',
          },
          {
            name: 'onChange',
            type: '(checked: boolean) => void',
            required: false,
            description: 'Change handler function',
          },
        ],
        examples: [
          {
            name: 'Basic Checkbox',
            code: '<Check label="Accept terms" />',
            description: 'Basic checkbox usage',
          },
          {
            name: 'Checked Checkbox',
            code: '<Check checked label="Selected" />',
            description: 'Pre-checked checkbox',
          },
        ],
      },
      {
        name: 'Chip',
        description: 'Chip component for tags and labels',
        category: 'Data Display',
        importPath: '@dealicious/design-system-react/src/components/ssm-chip',
        props: [
          {
            name: 'variant',
            type: "'default' | 'outlined' | 'filled'",
            required: false,
            defaultValue: "'default'",
            description: 'Chip variant style',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Chip size',
          },
          {
            name: 'onDelete',
            type: '() => void',
            required: false,
            description: 'Delete handler function',
          },
        ],
        examples: [
          {
            name: 'Basic Chip',
            code: '<Chip>Tag</Chip>',
            description: 'Basic chip usage',
          },
          {
            name: 'Deletable Chip',
            code: '<Chip onDelete={handleDelete}>Deletable</Chip>',
            description: 'Chip with delete action',
          },
        ],
      },
      {
        name: 'Dropdown',
        description: 'Dropdown select component',
        category: 'Forms',
        importPath: '@dealicious/design-system-react/src/components/ssm-dropdown',
        props: [
          {
            name: 'options',
            type: 'Array<{ value: string; label: string }>',
            required: true,
            description: 'Dropdown options',
          },
          {
            name: 'value',
            type: 'string',
            required: false,
            description: 'Selected value',
          },
          {
            name: 'placeholder',
            type: 'string',
            required: false,
            description: 'Placeholder text',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the dropdown is disabled',
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
            name: 'Basic Dropdown',
            code: '<Dropdown options={options} placeholder="Select..." />',
            description: 'Basic dropdown usage',
          },
        ],
      },
      {
        name: 'Error',
        description: 'Error message display component',
        category: 'Feedback',
        importPath: '@dealicious/design-system-react/src/components/ssm-error',
        props: [
          {
            name: 'message',
            type: 'string',
            required: true,
            description: 'Error message to display',
          },
          {
            name: 'dismissible',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the error can be dismissed',
          },
        ],
        examples: [
          {
            name: 'Basic Error',
            code: '<Error message="Something went wrong" />',
            description: 'Basic error display',
          },
        ],
      },
      {
        name: 'HelperText',
        description: 'Helper text component for form fields',
        category: 'Forms',
        importPath: '@dealicious/design-system-react/src/components/ssm-helper-text',
        props: [
          {
            name: 'text',
            type: 'string',
            required: true,
            description: 'Helper text content',
          },
          {
            name: 'variant',
            type: "'default' | 'error' | 'success'",
            required: false,
            defaultValue: "'default'",
            description: 'Helper text variant',
          },
        ],
        examples: [
          {
            name: 'Basic Helper Text',
            code: '<HelperText text="Enter your email address" />',
            description: 'Basic helper text',
          },
        ],
      },
      {
        name: 'Icon',
        description: 'Icon component for displaying icons',
        category: 'Media',
        importPath: '@dealicious/design-system-react/src/components/ssm-icon',
        props: [
          {
            name: 'name',
            type: 'string',
            required: true,
            description: 'Icon name',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Icon size',
          },
          {
            name: 'color',
            type: 'string',
            required: false,
            description: 'Icon color',
          },
        ],
        examples: [
          {
            name: 'Basic Icon',
            code: '<Icon name="home" />',
            description: 'Basic icon usage',
          },
        ],
      },
      {
        name: 'Input',
        description: 'Text input component with validation support',
        category: 'Forms',
        importPath: '@dealicious/design-system-react/src/components/ssm-input',
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
        name: 'LabeledText',
        description: 'Text component with label',
        category: 'Data Display',
        importPath: '@dealicious/design-system-react/src/components/ssm-labeled-text',
        props: [
          {
            name: 'label',
            type: 'string',
            required: true,
            description: 'Label text',
          },
          {
            name: 'value',
            type: 'string',
            required: true,
            description: 'Text value',
          },
        ],
        examples: [
          {
            name: 'Basic Labeled Text',
            code: '<LabeledText label="Name" value="John Doe" />',
            description: 'Basic labeled text',
          },
        ],
      },
      {
        name: 'LayerAlert',
        description: 'Alert layer component for notifications',
        category: 'Overlays',
        importPath: '@dealicious/design-system-react/src/components/ssm-layer-alert',
        props: [
          {
            name: 'isOpen',
            type: 'boolean',
            required: true,
            description: 'Whether the alert is open',
          },
          {
            name: 'onClose',
            type: '() => void',
            required: true,
            description: 'Close handler function',
          },
          {
            name: 'title',
            type: 'string',
            required: true,
            description: 'Alert title',
          },
          {
            name: 'message',
            type: 'string',
            required: true,
            description: 'Alert message',
          },
          {
            name: 'variant',
            type: "'info' | 'warning' | 'error' | 'success'",
            required: false,
            defaultValue: "'info'",
            description: 'Alert variant',
          },
        ],
        examples: [
          {
            name: 'Basic Alert',
            code: '<LayerAlert isOpen={isOpen} onClose={handleClose} title="Alert" message="Message" />',
            description: 'Basic alert layer',
          },
        ],
      },
      {
        name: 'LayerPopup',
        description: 'Popup layer component for modals',
        category: 'Overlays',
        importPath: '@dealicious/design-system-react/src/components/ssm-layer-popup',
        props: [
          {
            name: 'isOpen',
            type: 'boolean',
            required: true,
            description: 'Whether the popup is open',
          },
          {
            name: 'onClose',
            type: '() => void',
            required: true,
            description: 'Close handler function',
          },
          {
            name: 'title',
            type: 'string',
            required: false,
            description: 'Popup title',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large' | 'fullscreen'",
            required: false,
            defaultValue: "'medium'",
            description: 'Popup size',
          },
        ],
        examples: [
          {
            name: 'Basic Popup',
            code: '<LayerPopup isOpen={isOpen} onClose={handleClose} title="Popup">Content</LayerPopup>',
            description: 'Basic popup layer',
          },
        ],
      },
      {
        name: 'LoadingSpinner',
        description: 'Loading spinner component',
        category: 'Feedback',
        importPath: '@dealicious/design-system-react/src/components/ssm-loading-spinner',
        props: [
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Spinner size',
          },
          {
            name: 'color',
            type: 'string',
            required: false,
            description: 'Spinner color',
          },
        ],
        examples: [
          {
            name: 'Basic Spinner',
            code: '<LoadingSpinner />',
            description: 'Basic loading spinner',
          },
        ],
      },
      {
        name: 'Notice',
        description: 'Notice component for announcements',
        category: 'Feedback',
        importPath: '@dealicious/design-system-react/src/components/ssm-notice',
        props: [
          {
            name: 'message',
            type: 'string',
            required: true,
            description: 'Notice message',
          },
          {
            name: 'variant',
            type: "'info' | 'warning' | 'error' | 'success'",
            required: false,
            defaultValue: "'info'",
            description: 'Notice variant',
          },
          {
            name: 'dismissible',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the notice can be dismissed',
          },
        ],
        examples: [
          {
            name: 'Basic Notice',
            code: '<Notice message="Important announcement" />',
            description: 'Basic notice',
          },
        ],
      },
      {
        name: 'Pagination',
        description: 'Pagination component for page navigation',
        category: 'Navigation',
        importPath: '@dealicious/design-system-react/src/components/ssm-pagination',
        props: [
          {
            name: 'currentPage',
            type: 'number',
            required: true,
            description: 'Current page number',
          },
          {
            name: 'totalPages',
            type: 'number',
            required: true,
            description: 'Total number of pages',
          },
          {
            name: 'onPageChange',
            type: '(page: number) => void',
            required: true,
            description: 'Page change handler',
          },
        ],
        examples: [
          {
            name: 'Basic Pagination',
            code: '<Pagination currentPage={1} totalPages={10} onPageChange={handlePageChange} />',
            description: 'Basic pagination',
          },
        ],
      },
      {
        name: 'Radio',
        description: 'Radio button component',
        category: 'Forms',
        importPath: '@dealicious/design-system-react/src/components/ssm-radio',
        props: [
          {
            name: 'value',
            type: 'string',
            required: true,
            description: 'Radio value',
          },
          {
            name: 'checked',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the radio is checked',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the radio is disabled',
          },
          {
            name: 'label',
            type: 'string',
            required: false,
            description: 'Radio label text',
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
            name: 'Basic Radio',
            code: '<Radio value="option1" label="Option 1" />',
            description: 'Basic radio button',
          },
        ],
      },
      {
        name: 'Switch',
        description: 'Switch toggle component',
        category: 'Forms',
        importPath: '@dealicious/design-system-react/src/components/ssm-switch',
        props: [
          {
            name: 'checked',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the switch is checked',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the switch is disabled',
          },
          {
            name: 'label',
            type: 'string',
            required: false,
            description: 'Switch label text',
          },
          {
            name: 'onChange',
            type: '(checked: boolean) => void',
            required: false,
            description: 'Change handler function',
          },
        ],
        examples: [
          {
            name: 'Basic Switch',
            code: '<Switch label="Enable notifications" />',
            description: 'Basic switch usage',
          },
        ],
      },
      {
        name: 'Tab',
        description: 'Tab component for tabbed interfaces',
        category: 'Navigation',
        importPath: '@dealicious/design-system-react/src/components/ssm-tab',
        props: [
          {
            name: 'tabs',
            type: 'Array<{ id: string; label: string }>',
            required: true,
            description: 'Tab items',
          },
          {
            name: 'activeTab',
            type: 'string',
            required: true,
            description: 'Active tab ID',
          },
          {
            name: 'onTabChange',
            type: '(tabId: string) => void',
            required: true,
            description: 'Tab change handler',
          },
        ],
        examples: [
          {
            name: 'Basic Tabs',
            code: '<Tab tabs={tabs} activeTab="tab1" onTabChange={handleTabChange} />',
            description: 'Basic tab component',
          },
        ],
      },
      {
        name: 'Tag',
        description: 'Tag component for labels and categories',
        category: 'Data Display',
        importPath: '@dealicious/design-system-react/src/components/ssm-tag',
        props: [
          {
            name: 'variant',
            type: "'default' | 'primary' | 'success' | 'error' | 'warning'",
            required: false,
            defaultValue: "'default'",
            description: 'Tag variant style',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Tag size',
          },
        ],
        examples: [
          {
            name: 'Basic Tag',
            code: '<Tag>Label</Tag>',
            description: 'Basic tag usage',
          },
        ],
      },
      {
        name: 'TextField',
        description: 'Text field component with label',
        category: 'Forms',
        importPath: '@dealicious/design-system-react/src/components/ssm-text-field',
        props: [
          {
            name: 'label',
            type: 'string',
            required: true,
            description: 'Field label',
          },
          {
            name: 'value',
            type: 'string',
            required: false,
            description: 'Field value',
          },
          {
            name: 'placeholder',
            type: 'string',
            required: false,
            description: 'Placeholder text',
          },
          {
            name: 'error',
            type: 'string',
            required: false,
            description: 'Error message',
          },
          {
            name: 'helperText',
            type: 'string',
            required: false,
            description: 'Helper text',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the field is disabled',
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
            name: 'Basic Text Field',
            code: '<TextField label="Name" placeholder="Enter name" />',
            description: 'Basic text field',
          },
        ],
      },
      {
        name: 'TextLink',
        description: 'Text link component',
        category: 'Actions',
        importPath: '@dealicious/design-system-react/src/components/ssm-text-link',
        props: [
          {
            name: 'href',
            type: 'string',
            required: true,
            description: 'Link URL',
          },
          {
            name: 'target',
            type: "'_self' | '_blank' | '_parent' | '_top'",
            required: false,
            defaultValue: "'_self'",
            description: 'Link target',
          },
          {
            name: 'variant',
            type: "'default' | 'primary' | 'secondary'",
            required: false,
            defaultValue: "'default'",
            description: 'Link variant style',
          },
        ],
        examples: [
          {
            name: 'Basic Text Link',
            code: '<TextLink href="/about">About</TextLink>',
            description: 'Basic text link',
          },
        ],
      },
      {
        name: 'Text',
        description: 'Text component for typography',
        category: 'Data Display',
        importPath: '@dealicious/design-system-react/src/components/ssm-text',
        props: [
          {
            name: 'variant',
            type: "'body' | 'heading' | 'caption' | 'overline'",
            required: false,
            defaultValue: "'body'",
            description: 'Text variant',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Text size',
          },
          {
            name: 'color',
            type: 'string',
            required: false,
            description: 'Text color',
          },
        ],
        examples: [
          {
            name: 'Basic Text',
            code: '<Text>Hello World</Text>',
            description: 'Basic text component',
          },
          {
            name: 'Heading Text',
            code: '<Text variant="heading" size="large">Title</Text>',
            description: 'Heading text',
          },
        ],
      },
      {
        name: 'Toast',
        description: 'Toast notification component',
        category: 'Feedback',
        importPath: '@dealicious/design-system-react/src/components/ssm-toast',
        props: [
          {
            name: 'message',
            type: 'string',
            required: true,
            description: 'Toast message',
          },
          {
            name: 'variant',
            type: "'success' | 'error' | 'warning' | 'info'",
            required: false,
            defaultValue: "'info'",
            description: 'Toast variant',
          },
          {
            name: 'duration',
            type: 'number',
            required: false,
            defaultValue: '3000',
            description: 'Toast duration in milliseconds',
          },
        ],
        examples: [
          {
            name: 'Basic Toast',
            code: '<Toast message="Operation completed" variant="success" />',
            description: 'Basic toast notification',
          },
        ],
      },
      {
        name: 'Tooltip',
        description: 'Tooltip component for hover information',
        category: 'Feedback',
        importPath: '@dealicious/design-system-react/src/components/ssm-tooltip',
        props: [
          {
            name: 'content',
            type: 'string',
            required: true,
            description: 'Tooltip content',
          },
          {
            name: 'placement',
            type: "'top' | 'bottom' | 'left' | 'right'",
            required: false,
            defaultValue: "'top'",
            description: 'Tooltip placement',
          },
        ],
        examples: [
          {
            name: 'Basic Tooltip',
            code: '<Tooltip content="Help text"><Button>Hover me</Button></Tooltip>',
            description: 'Basic tooltip usage',
          },
        ],
      },
      {
        name: 'EnvBadge',
        description: 'Environment badge component',
        category: 'Data Display',
        importPath: '@dealicious/design-system-react/src/components/env-badge',
        props: [
          {
            name: 'environment',
            type: "'development' | 'staging' | 'production'",
            required: true,
            description: 'Environment type',
          },
        ],
        examples: [
          {
            name: 'Basic Env Badge',
            code: '<EnvBadge environment="development" />',
            description: 'Basic environment badge',
          },
        ],
      },
    ];

    this.vueComponents = [
      {
        name: 'SsmAccordion',
        description: 'Accordion component for collapsible content sections',
        category: 'Layout',
        importPath: '@dealicious/design-system/src/components/ssm-accordion',
        props: [
          {
            name: 'title',
            type: 'string',
            required: true,
            description: 'Accordion title',
          },
          {
            name: 'defaultExpanded',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the accordion is expanded by default',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the accordion is disabled',
          },
        ],
        examples: [
          {
            name: 'Basic Accordion',
            code: '<SsmAccordion title="Section Title">Content here</SsmAccordion>',
            description: 'Basic accordion usage',
          },
        ],
      },
      {
        name: 'SsmArrowPagination',
        description: 'Arrow-based pagination component',
        category: 'Navigation',
        importPath: '@dealicious/design-system/src/components/ssm-arrow-pagination',
        props: [
          {
            name: 'currentPage',
            type: 'number',
            required: true,
            description: 'Current page number',
          },
          {
            name: 'totalPages',
            type: 'number',
            required: true,
            description: 'Total number of pages',
          },
          {
            name: 'onPageChange',
            type: '(page: number) => void',
            required: true,
            description: 'Page change handler',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether pagination is disabled',
          },
        ],
        examples: [
          {
            name: 'Basic Arrow Pagination',
            code: '<SsmArrowPagination :current-page="1" :total-pages="10" @page-change="handlePageChange" />',
            description: 'Basic arrow pagination',
          },
        ],
      },
      {
        name: 'SsmBadge',
        description: 'Badge component for status indicators',
        category: 'Data Display',
        importPath: '@dealicious/design-system/src/components/ssm-badge',
        props: [
          {
            name: 'variant',
            type: "'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'",
            required: false,
            defaultValue: "'primary'",
            description: 'Badge variant style',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Badge size',
          },
        ],
        examples: [
          {
            name: 'Basic Badge',
            code: '<SsmBadge>New</SsmBadge>',
            description: 'Basic badge usage',
          },
          {
            name: 'Success Badge',
            code: '<SsmBadge variant="success">Completed</SsmBadge>',
            description: 'Success variant badge',
          },
        ],
      },
      {
        name: 'SsmButton',
        description: 'Primary button component with multiple variants',
        category: 'Actions',
        importPath: '@dealicious/design-system/src/components/ssm-button',
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
            code: '<SsmButton>Click me</SsmButton>',
            description: 'Basic button usage',
          },
          {
            name: 'Primary Button',
            code: '<SsmButton variant="primary">Primary</SsmButton>',
            description: 'Primary variant button',
          },
        ],
      },
      {
        name: 'SsmCheck',
        description: 'Checkbox component for form inputs',
        category: 'Forms',
        importPath: '@dealicious/design-system/src/components/ssm-check',
        props: [
          {
            name: 'modelValue',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the checkbox is checked (v-model)',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the checkbox is disabled',
          },
          {
            name: 'label',
            type: 'string',
            required: false,
            description: 'Checkbox label text',
          },
        ],
        examples: [
          {
            name: 'Basic Checkbox',
            code: '<SsmCheck label="Accept terms" v-model="checked" />',
            description: 'Basic checkbox usage',
          },
        ],
      },
      {
        name: 'SsmChip',
        description: 'Chip component for tags and labels',
        category: 'Data Display',
        importPath: '@dealicious/design-system/src/components/ssm-chip',
        props: [
          {
            name: 'variant',
            type: "'default' | 'outlined' | 'filled'",
            required: false,
            defaultValue: "'default'",
            description: 'Chip variant style',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Chip size',
          },
        ],
        examples: [
          {
            name: 'Basic Chip',
            code: '<SsmChip>Tag</SsmChip>',
            description: 'Basic chip usage',
          },
        ],
      },
      {
        name: 'SsmDropdown',
        description: 'Dropdown select component',
        category: 'Forms',
        importPath: '@dealicious/design-system/src/components/ssm-dropdown',
        props: [
          {
            name: 'options',
            type: 'Array<{ value: string; label: string }>',
            required: true,
            description: 'Dropdown options',
          },
          {
            name: 'modelValue',
            type: 'string',
            required: false,
            description: 'Selected value (v-model)',
          },
          {
            name: 'placeholder',
            type: 'string',
            required: false,
            description: 'Placeholder text',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the dropdown is disabled',
          },
        ],
        examples: [
          {
            name: 'Basic Dropdown',
            code: '<SsmDropdown :options="options" placeholder="Select..." v-model="selected" />',
            description: 'Basic dropdown usage',
          },
        ],
      },
      {
        name: 'SsmError',
        description: 'Error message display component',
        category: 'Feedback',
        importPath: '@dealicious/design-system/src/components/ssm-error',
        props: [
          {
            name: 'message',
            type: 'string',
            required: true,
            description: 'Error message to display',
          },
          {
            name: 'dismissible',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the error can be dismissed',
          },
        ],
        examples: [
          {
            name: 'Basic Error',
            code: '<SsmError message="Something went wrong" />',
            description: 'Basic error display',
          },
        ],
      },
      {
        name: 'SsmHelperText',
        description: 'Helper text component for form fields',
        category: 'Forms',
        importPath: '@dealicious/design-system/src/components/ssm-helper-text',
        props: [
          {
            name: 'text',
            type: 'string',
            required: true,
            description: 'Helper text content',
          },
          {
            name: 'variant',
            type: "'default' | 'error' | 'success'",
            required: false,
            defaultValue: "'default'",
            description: 'Helper text variant',
          },
        ],
        examples: [
          {
            name: 'Basic Helper Text',
            code: '<SsmHelperText text="Enter your email address" />',
            description: 'Basic helper text',
          },
        ],
      },
      {
        name: 'SsmIcon',
        description: 'Icon component for displaying icons',
        category: 'Media',
        importPath: '@dealicious/design-system/src/components/ssm-icon',
        props: [
          {
            name: 'name',
            type: 'string',
            required: true,
            description: 'Icon name',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Icon size',
          },
          {
            name: 'color',
            type: 'string',
            required: false,
            description: 'Icon color',
          },
        ],
        examples: [
          {
            name: 'Basic Icon',
            code: '<SsmIcon name="home" />',
            description: 'Basic icon usage',
          },
        ],
      },
      {
        name: 'SsmImage',
        description: 'Image component with loading and error handling',
        category: 'Media',
        importPath: '@dealicious/design-system/src/components/ssm-image',
        props: [
          {
            name: 'src',
            type: 'string',
            required: true,
            description: 'Image source URL',
          },
          {
            name: 'alt',
            type: 'string',
            required: false,
            description: 'Image alt text',
          },
          {
            name: 'width',
            type: 'string | number',
            required: false,
            description: 'Image width',
          },
          {
            name: 'height',
            type: 'string | number',
            required: false,
            description: 'Image height',
          },
        ],
        examples: [
          {
            name: 'Basic Image',
            code: '<SsmImage src="/image.jpg" alt="Description" />',
            description: 'Basic image usage',
          },
        ],
      },
      {
        name: 'SsmInput',
        description: 'Text input component with validation support',
        category: 'Forms',
        importPath: '@dealicious/design-system/src/components/ssm-input',
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
            code: '<SsmInput placeholder="Enter text" v-model="value" />',
            description: 'Basic input field with v-model',
          },
          {
            name: 'Input with Error',
            code: '<SsmInput error="This field is required" />',
            description: 'Input with error state',
          },
        ],
      },
      {
        name: 'SsmLabeledText',
        description: 'Text component with label',
        category: 'Data Display',
        importPath: '@dealicious/design-system/src/components/ssm-labeled-text',
        props: [
          {
            name: 'label',
            type: 'string',
            required: true,
            description: 'Label text',
          },
          {
            name: 'value',
            type: 'string',
            required: true,
            description: 'Text value',
          },
        ],
        examples: [
          {
            name: 'Basic Labeled Text',
            code: '<SsmLabeledText label="Name" value="John Doe" />',
            description: 'Basic labeled text',
          },
        ],
      },
      {
        name: 'SsmLayerAlert',
        description: 'Alert layer component for notifications',
        category: 'Overlays',
        importPath: '@dealicious/design-system/src/components/ssm-layer-alert',
        props: [
          {
            name: 'isOpen',
            type: 'boolean',
            required: true,
            description: 'Whether the alert is open',
          },
          {
            name: 'title',
            type: 'string',
            required: true,
            description: 'Alert title',
          },
          {
            name: 'message',
            type: 'string',
            required: true,
            description: 'Alert message',
          },
          {
            name: 'variant',
            type: "'info' | 'warning' | 'error' | 'success'",
            required: false,
            defaultValue: "'info'",
            description: 'Alert variant',
          },
        ],
        examples: [
          {
            name: 'Basic Alert',
            code: '<SsmLayerAlert :is-open="isOpen" title="Alert" message="Message" @close="handleClose" />',
            description: 'Basic alert layer',
          },
        ],
      },
      {
        name: 'SsmLayerModal',
        description: 'Modal layer component for dialogs',
        category: 'Overlays',
        importPath: '@dealicious/design-system/src/components/ssm-layer-modal',
        props: [
          {
            name: 'isOpen',
            type: 'boolean',
            required: true,
            description: 'Whether the modal is open',
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
            code: '<SsmLayerModal :is-open="isOpen" title="Modal Title" @close="handleClose">Content</SsmLayerModal>',
            description: 'Basic modal layer',
          },
        ],
      },
      {
        name: 'SsmLoadingSpinner',
        description: 'Loading spinner component',
        category: 'Feedback',
        importPath: '@dealicious/design-system/src/components/ssm-loading-spinner',
        props: [
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Spinner size',
          },
          {
            name: 'color',
            type: 'string',
            required: false,
            description: 'Spinner color',
          },
        ],
        examples: [
          {
            name: 'Basic Spinner',
            code: '<SsmLoadingSpinner />',
            description: 'Basic loading spinner',
          },
        ],
      },
      {
        name: 'SsmNotice',
        description: 'Notice component for announcements',
        category: 'Feedback',
        importPath: '@dealicious/design-system/src/components/ssm-notice',
        props: [
          {
            name: 'message',
            type: 'string',
            required: true,
            description: 'Notice message',
          },
          {
            name: 'variant',
            type: "'info' | 'warning' | 'error' | 'success'",
            required: false,
            defaultValue: "'info'",
            description: 'Notice variant',
          },
          {
            name: 'dismissible',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the notice can be dismissed',
          },
        ],
        examples: [
          {
            name: 'Basic Notice',
            code: '<SsmNotice message="Important announcement" />',
            description: 'Basic notice',
          },
        ],
      },
      {
        name: 'SsmPagination',
        description: 'Pagination component for page navigation',
        category: 'Navigation',
        importPath: '@dealicious/design-system/src/components/ssm-pagination',
        props: [
          {
            name: 'currentPage',
            type: 'number',
            required: true,
            description: 'Current page number',
          },
          {
            name: 'totalPages',
            type: 'number',
            required: true,
            description: 'Total number of pages',
          },
        ],
        examples: [
          {
            name: 'Basic Pagination',
            code: '<SsmPagination :current-page="1" :total-pages="10" @page-change="handlePageChange" />',
            description: 'Basic pagination',
          },
        ],
      },
      {
        name: 'SsmRadioGroup',
        description: 'Radio button group component',
        category: 'Forms',
        importPath: '@dealicious/design-system/src/components/ssm-radio-group',
        props: [
          {
            name: 'options',
            type: 'Array<{ value: string; label: string }>',
            required: true,
            description: 'Radio options',
          },
          {
            name: 'modelValue',
            type: 'string',
            required: false,
            description: 'Selected value (v-model)',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the radio group is disabled',
          },
        ],
        examples: [
          {
            name: 'Basic Radio Group',
            code: '<SsmRadioGroup :options="options" v-model="selected" />',
            description: 'Basic radio group',
          },
        ],
      },
      {
        name: 'SsmSwitch',
        description: 'Switch toggle component',
        category: 'Forms',
        importPath: '@dealicious/design-system/src/components/ssm-switch',
        props: [
          {
            name: 'modelValue',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the switch is checked (v-model)',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the switch is disabled',
          },
          {
            name: 'label',
            type: 'string',
            required: false,
            description: 'Switch label text',
          },
        ],
        examples: [
          {
            name: 'Basic Switch',
            code: '<SsmSwitch label="Enable notifications" v-model="enabled" />',
            description: 'Basic switch usage',
          },
        ],
      },
      {
        name: 'SsmTab',
        description: 'Tab component for tabbed interfaces',
        category: 'Navigation',
        importPath: '@dealicious/design-system/src/components/ssm-tab',
        props: [
          {
            name: 'tabs',
            type: 'Array<{ id: string; label: string }>',
            required: true,
            description: 'Tab items',
          },
          {
            name: 'activeTab',
            type: 'string',
            required: true,
            description: 'Active tab ID',
          },
        ],
        examples: [
          {
            name: 'Basic Tabs',
            code: '<SsmTab :tabs="tabs" :active-tab="activeTab" @tab-change="handleTabChange" />',
            description: 'Basic tab component',
          },
        ],
      },
      {
        name: 'SsmTag',
        description: 'Tag component for labels and categories',
        category: 'Data Display',
        importPath: '@dealicious/design-system/src/components/ssm-tag',
        props: [
          {
            name: 'variant',
            type: "'default' | 'primary' | 'success' | 'error' | 'warning'",
            required: false,
            defaultValue: "'default'",
            description: 'Tag variant style',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Tag size',
          },
        ],
        examples: [
          {
            name: 'Basic Tag',
            code: '<SsmTag>Label</SsmTag>',
            description: 'Basic tag usage',
          },
        ],
      },
      {
        name: 'SsmText',
        description: 'Text component for typography',
        category: 'Data Display',
        importPath: '@dealicious/design-system/src/components/ssm-text',
        props: [
          {
            name: 'variant',
            type: "'body' | 'heading' | 'caption' | 'overline'",
            required: false,
            defaultValue: "'body'",
            description: 'Text variant',
          },
          {
            name: 'size',
            type: "'small' | 'medium' | 'large'",
            required: false,
            defaultValue: "'medium'",
            description: 'Text size',
          },
          {
            name: 'color',
            type: 'string',
            required: false,
            description: 'Text color',
          },
        ],
        examples: [
          {
            name: 'Basic Text',
            code: '<SsmText>Hello World</SsmText>',
            description: 'Basic text component',
          },
          {
            name: 'Heading Text',
            code: '<SsmText variant="heading" size="large">Title</SsmText>',
            description: 'Heading text',
          },
        ],
      },
      {
        name: 'SsmTextField',
        description: 'Text field component with label',
        category: 'Forms',
        importPath: '@dealicious/design-system/src/components/ssm-text-field',
        props: [
          {
            name: 'label',
            type: 'string',
            required: true,
            description: 'Field label',
          },
          {
            name: 'modelValue',
            type: 'string',
            required: false,
            description: 'Field value (v-model)',
          },
          {
            name: 'placeholder',
            type: 'string',
            required: false,
            description: 'Placeholder text',
          },
          {
            name: 'error',
            type: 'string',
            required: false,
            description: 'Error message',
          },
          {
            name: 'helperText',
            type: 'string',
            required: false,
            description: 'Helper text',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            defaultValue: 'false',
            description: 'Whether the field is disabled',
          },
        ],
        examples: [
          {
            name: 'Basic Text Field',
            code: '<SsmTextField label="Name" placeholder="Enter name" v-model="name" />',
            description: 'Basic text field',
          },
        ],
      },
      {
        name: 'SsmTextLink',
        description: 'Text link component',
        category: 'Actions',
        importPath: '@dealicious/design-system/src/components/ssm-text-link',
        props: [
          {
            name: 'href',
            type: 'string',
            required: true,
            description: 'Link URL',
          },
          {
            name: 'target',
            type: "'_self' | '_blank' | '_parent' | '_top'",
            required: false,
            defaultValue: "'_self'",
            description: 'Link target',
          },
          {
            name: 'variant',
            type: "'default' | 'primary' | 'secondary'",
            required: false,
            defaultValue: "'default'",
            description: 'Link variant style',
          },
        ],
        examples: [
          {
            name: 'Basic Text Link',
            code: '<SsmTextLink href="/about">About</SsmTextLink>',
            description: 'Basic text link',
          },
        ],
      },
      {
        name: 'SsmToast',
        description: 'Toast notification component',
        category: 'Feedback',
        importPath: '@dealicious/design-system/src/components/ssm-toast',
        props: [
          {
            name: 'message',
            type: 'string',
            required: true,
            description: 'Toast message',
          },
          {
            name: 'variant',
            type: "'success' | 'error' | 'warning' | 'info'",
            required: false,
            defaultValue: "'info'",
            description: 'Toast variant',
          },
          {
            name: 'duration',
            type: 'number',
            required: false,
            defaultValue: '3000',
            description: 'Toast duration in milliseconds',
          },
        ],
        examples: [
          {
            name: 'Basic Toast',
            code: '<SsmToast message="Operation completed" variant="success" />',
            description: 'Basic toast notification',
          },
        ],
      },
      {
        name: 'SsmTooltip',
        description: 'Tooltip component for hover information',
        category: 'Feedback',
        importPath: '@dealicious/design-system/src/components/ssm-tooltip',
        props: [
          {
            name: 'content',
            type: 'string',
            required: true,
            description: 'Tooltip content',
          },
          {
            name: 'placement',
            type: "'top' | 'bottom' | 'left' | 'right'",
            required: false,
            defaultValue: "'top'",
            description: 'Tooltip placement',
          },
        ],
        examples: [
          {
            name: 'Basic Tooltip',
            code: '<SsmTooltip content="Help text"><SsmButton>Hover me</SsmButton></SsmTooltip>',
            description: 'Basic tooltip usage',
          },
        ],
      },
      {
        name: 'EnvBadge',
        description: 'Environment badge component',
        category: 'Data Display',
        importPath: '@dealicious/design-system/src/components/env-badge',
        props: [
          {
            name: 'environment',
            type: "'development' | 'staging' | 'production'",
            required: true,
            description: 'Environment type',
          },
        ],
        examples: [
          {
            name: 'Basic Env Badge',
            code: '<EnvBadge environment="development" />',
            description: 'Basic environment badge',
          },
        ],
      },
    ];
  }

  /**
   * 프레임워크(React 또는 Vue)에 대해 사용 가능한 구성 요소 가져오기
   */
  async getAvailableComponents(framework: 'react' | 'vue'): Promise<DesignSystemComponent[]> {
    return framework === 'react' ? this.reactComponents : this.vueComponents;
  }

  /**
   * Figma 컴포넌트(FigmaNode)에 가장 잘 맞는 컴포넌트(DesignSystemComponent) 찾기
   */
  findBestMatch(figmaComponentName: string, framework: 'react' | 'vue'): DesignSystemComponent | null {
    const components = framework === 'react' ? this.reactComponents : this.vueComponents;
    
    // 정규화: ssm- 접두사 제거, 하이픈 제거, 소문자 변환
    const normalizeName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/^ssm-/, '') // ssm- 접두사 제거
        .replace(/^ssm/, '') // ssm 접두사 제거
        .replace(/-/g, '') // 하이픈 제거
        .trim();
    };

    const normalizedFigmaName = normalizeName(figmaComponentName);
    
    // Direct name match (정규화된 이름으로 비교)
    const directMatch = components.find(comp => {
      const normalizedCompName = normalizeName(comp.name);
      return normalizedCompName === normalizedFigmaName;
    });
    if (directMatch) return directMatch;

    // 패턴 기반 유사 매칭
    const lowerName = normalizedFigmaName;
    
    for (const component of components) {
      const componentName = normalizeName(component.name);
      
      // Figma 이름에 컴포넌트 이름이 포함되어 있는지 확인
      if (lowerName.includes(componentName) || componentName.includes(lowerName)) {
        return component;
      }
      
      // 일반적인 변형 확인
      const variations = [
        componentName + 's', // 복수형
        componentName.replace('button', 'btn'),
        componentName.replace('input', 'field'),
        componentName.replace('card', 'panel'),
        componentName.replace('modal', 'popup'),
        componentName.replace('modal', 'dialog'),
        componentName.replace('textfield', 'textfield'),
        componentName.replace('textfield', 'input'),
        componentName.replace('radiogroup', 'radio'),
        componentName.replace('layerpopup', 'popup'),
        componentName.replace('layerpopup', 'modal'),
        componentName.replace('layeralert', 'alert'),
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
   * 이름으로 컴포넌트 가져오기
   */
  getComponent(name: string, framework: 'react' | 'vue'): DesignSystemComponent | null {
    const components = framework === 'react' ? this.reactComponents : this.vueComponents;
    return components.find(comp => comp.name === name) || null;
  }

  /**
   * 카테고리로 컴포넌트 가져오기
   */
  getComponentsByCategory(category: string, framework: 'react' | 'vue'): DesignSystemComponent[] {
    const components = framework === 'react' ? this.reactComponents : this.vueComponents;
    return components.filter(comp => comp.category === category);
  }

  /**
   * 모든 가능한 카테고리 가져오기
   */
  getCategories(framework: 'react' | 'vue'): string[] {
    const components = framework === 'react' ? this.reactComponents : this.vueComponents;
    const categories = new Set(components.map(comp => comp.category));
    return Array.from(categories);
  }
}
