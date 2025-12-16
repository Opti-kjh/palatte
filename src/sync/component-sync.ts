/**
 * 컴포넌트 동기화 서비스
 * GitHub에서 디자인 시스템 컴포넌트를 가져와 분석하고 캐시합니다.
 */

import { GitHubClient, type GitHubConfig } from './github-client.js';
import { TypeScriptAnalyzer } from './typescript-analyzer.js';
import { CacheManager } from './cache-manager.js';
import type { DesignSystemComponent, ComponentProp, ComponentExample } from '../services/design-system.js';

export interface SyncOptions {
  force?: boolean;  // 캐시를 무시하고 강제 동기화
  verbose?: boolean;  // 상세 로그 출력
}

export interface SyncResult {
  success: boolean;
  fromCache: boolean;
  reactComponents: DesignSystemComponent[];
  vueComponents: DesignSystemComponent[];
  commitSha: string;
  syncedAt: string;
  error?: string;
}

// 카테고리 매핑
const CATEGORY_MAP: Record<string, string> = {
  button: 'Actions',
  'text-link': 'Actions',
  input: 'Forms',
  check: 'Forms',
  radio: 'Forms',
  switch: 'Forms',
  dropdown: 'Forms',
  'text-field': 'Forms',
  'helper-text': 'Forms',
  text: 'Data Display',
  tag: 'Data Display',
  chip: 'Data Display',
  badge: 'Data Display',
  'labeled-text': 'Data Display',
  icon: 'Media',
  image: 'Media',
  toast: 'Feedback',
  notice: 'Feedback',
  error: 'Feedback',
  tooltip: 'Feedback',
  'loading-spinner': 'Feedback',
  'layer-popup': 'Overlays',
  'layer-alert': 'Overlays',
  'layer-modal': 'Overlays',
  accordion: 'Layout',
  tab: 'Navigation',
  pagination: 'Navigation',
  'arrow-pagination': 'Navigation',
};

/**
 * 디자인 시스템 컴포넌트 동기화 서비스
 */
export class ComponentSyncService {
  private githubClient: GitHubClient;
  private analyzer: TypeScriptAnalyzer;
  private cacheManager: CacheManager;
  private verbose: boolean = false;

  constructor(config?: Partial<GitHubConfig>) {
    this.githubClient = new GitHubClient(config);
    this.analyzer = new TypeScriptAnalyzer();
    this.cacheManager = new CacheManager();
  }

  /**
   * 컴포넌트 동기화 실행
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    this.verbose = options.verbose || false;
    const startTime = Date.now();

    try {
      // GitHub API 연결 확인
      const isAvailable = await this.githubClient.isAvailable();
      if (!isAvailable) {
        this.log('GitHub API 연결 실패, 캐시에서 로드 시도...');
        return this.loadFromCacheOrFail();
      }

      // 최신 커밋 SHA 가져오기
      const commitInfo = await this.githubClient.getLatestCommitSha();
      this.log(`최신 커밋: ${commitInfo.sha.substring(0, 7)}`);

      // 캐시 유효성 확인
      if (!options.force) {
        const isValid = await this.cacheManager.isValid(commitInfo.sha);
        if (isValid) {
          this.log('캐시가 유효합니다. 캐시에서 로드합니다.');
          const cached = await this.cacheManager.load();
          if (cached) {
            return {
              success: true,
              fromCache: true,
              reactComponents: cached.reactComponents,
              vueComponents: cached.vueComponents,
              commitSha: commitInfo.sha,
              syncedAt: cached.metadata.lastSyncedAt,
            };
          }
        }
      }

      // GitHub에서 컴포넌트 가져오기
      this.log('GitHub에서 컴포넌트 동기화 중...');

      const [reactComponents, vueComponents] = await Promise.all([
        this.syncReactComponents(commitInfo.sha),
        this.syncVueComponents(commitInfo.sha),
      ]);

      // 캐시 저장
      await this.cacheManager.save(commitInfo.sha, reactComponents, vueComponents);

      const elapsed = Date.now() - startTime;
      this.log(`동기화 완료: ${elapsed}ms`);

      return {
        success: true,
        fromCache: false,
        reactComponents,
        vueComponents,
        commitSha: commitInfo.sha,
        syncedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('컴포넌트 동기화 실패:', error);

      // 실패 시 캐시에서 로드 시도
      return this.loadFromCacheOrFail(error);
    }
  }

  /**
   * React 컴포넌트 동기화
   */
  private async syncReactComponents(ref: string): Promise<DesignSystemComponent[]> {
    const componentDirs = await this.githubClient.getReactComponentList(ref);
    this.log(`React 컴포넌트 발견: ${componentDirs.length}개`);

    const components: DesignSystemComponent[] = [];

    for (const dir of componentDirs) {
      try {
        const source = await this.githubClient.getReactComponentSource(dir, ref);
        if (!source) {
          this.log(`  - ${dir}: 소스 파일 없음, 스킵`);
          continue;
        }

        const analyzed = this.analyzer.analyzeReactComponent(source.content, dir);
        if (!analyzed) {
          this.log(`  - ${dir}: 분석 실패, 스킵`);
          continue;
        }

        const component = this.createReactComponent(dir, analyzed);
        components.push(component);
        this.log(`  + ${dir}: ${analyzed.props.length}개 props`);
      } catch (error) {
        this.log(`  ! ${dir}: 오류 - ${error}`);
      }
    }

    return components;
  }

  /**
   * Vue 컴포넌트 동기화
   */
  private async syncVueComponents(ref: string): Promise<DesignSystemComponent[]> {
    const componentDirs = await this.githubClient.getVueComponentList(ref);
    this.log(`Vue 컴포넌트 발견: ${componentDirs.length}개`);

    const components: DesignSystemComponent[] = [];

    for (const dir of componentDirs) {
      try {
        const source = await this.githubClient.getVueComponentSource(dir, ref);
        if (!source) {
          this.log(`  - ${dir}: 소스 파일 없음, 스킵`);
          continue;
        }

        const analyzed = this.analyzer.analyzeVueComponent(source.content, dir);
        if (!analyzed) {
          this.log(`  - ${dir}: 분석 실패, 스킵`);
          continue;
        }

        const component = this.createVueComponent(dir, analyzed);
        components.push(component);
        this.log(`  + ${dir}: ${analyzed.props.length}개 props`);
      } catch (error) {
        this.log(`  ! ${dir}: 오류 - ${error}`);
      }
    }

    return components;
  }

  /**
   * React 컴포넌트 객체 생성
   */
  private createReactComponent(
    dir: string,
    analyzed: { name: string; description: string; props: ComponentProp[]; examples: ComponentExample[] }
  ): DesignSystemComponent {
    return {
      name: analyzed.name,
      description: analyzed.description,
      category: this.guessCategory(dir),
      props: analyzed.props,
      examples: analyzed.examples,
      importPath: `@dealicious/design-system-react/src/components/${dir}`,
    };
  }

  /**
   * Vue 컴포넌트 객체 생성
   */
  private createVueComponent(
    dir: string,
    analyzed: { name: string; description: string; props: ComponentProp[]; examples: ComponentExample[] }
  ): DesignSystemComponent {
    return {
      name: analyzed.name,
      description: analyzed.description,
      category: this.guessCategory(dir),
      props: analyzed.props,
      examples: this.convertToVueExamples(analyzed.examples, analyzed.name),
      importPath: `@dealicious/design-system/src/components/${dir}`,
    };
  }

  /**
   * 디렉토리 이름에서 카테고리 추측
   */
  private guessCategory(dir: string): string {
    const normalized = dir.replace(/^ssm-/, '').toLowerCase();

    // 정확한 매칭
    if (CATEGORY_MAP[normalized]) {
      return CATEGORY_MAP[normalized];
    }

    // 부분 매칭
    for (const [key, category] of Object.entries(CATEGORY_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return category;
      }
    }

    return 'General';
  }

  /**
   * React 예제를 Vue 예제로 변환
   */
  private convertToVueExamples(
    examples: ComponentExample[],
    componentName: string
  ): ComponentExample[] {
    return examples.map((example) => ({
      ...example,
      code: example.code
        // JSX props를 Vue props로 변환
        .replace(/(\w+)={([^}]+)}/g, ':$1="$2"')
        // onClick을 @click으로
        .replace(/onClick/g, '@click')
        // onChange를 @change 또는 v-model로
        .replace(/onChange/g, '@change')
        // boolean props
        .replace(/(\w+)={true}/g, '$1')
        .replace(/(\w+)={false}/g, ':$1="false"'),
    }));
  }

  /**
   * 캐시에서 로드하거나 실패 반환
   */
  private async loadFromCacheOrFail(originalError?: unknown): Promise<SyncResult> {
    const cached = await this.cacheManager.load();

    if (cached) {
      this.log('캐시에서 로드 성공 (폴백)');
      return {
        success: true,
        fromCache: true,
        reactComponents: cached.reactComponents,
        vueComponents: cached.vueComponents,
        commitSha: cached.metadata.commitSha,
        syncedAt: cached.metadata.lastSyncedAt,
      };
    }

    // 에러 메시지 추출
    let errorMessage = 'Unknown error';
    if (originalError instanceof Error) {
      errorMessage = originalError.message;
    } else if (typeof originalError === 'string') {
      errorMessage = originalError;
    } else if (originalError && typeof originalError === 'object') {
      // Octokit 에러 처리
      const octokitError = originalError as any;
      if (octokitError.status === 401) {
        errorMessage = 'GitHub API 인증 실패. GITHUB_TOKEN 환경 변수를 설정하세요.';
      } else if (octokitError.status === 403) {
        errorMessage = 'GitHub API rate limit 초과. 잠시 후 다시 시도하거나 GITHUB_TOKEN을 설정하세요.';
      } else if (octokitError.status === 404) {
        errorMessage = 'GitHub 저장소를 찾을 수 없습니다. 저장소 경로를 확인하세요.';
      } else if (octokitError.message) {
        errorMessage = octokitError.message;
      }
    }

    return {
      success: false,
      fromCache: false,
      reactComponents: [],
      vueComponents: [],
      commitSha: '',
      syncedAt: new Date().toISOString(),
      error: errorMessage,
    };
  }

  /**
   * 캐시 상태 확인
   */
  async getCacheStatus(): Promise<{
    exists: boolean;
    isValid: boolean;
    metadata: {
      version: string;
      lastSyncedAt: string;
      commitSha: string;
      reactComponentCount: number;
      vueComponentCount: number;
    } | null;
  }> {
    const status = await this.cacheManager.getStatus();
    let isValid = false;

    if (status.exists && status.metadata) {
      try {
        const commitInfo = await this.githubClient.getLatestCommitSha();
        isValid = status.metadata.commitSha === commitInfo.sha;
      } catch {
        // GitHub 연결 실패 시 캐시가 있으면 유효하다고 간주
        isValid = true;
      }
    }

    return {
      exists: status.exists,
      isValid,
      metadata: status.metadata,
    };
  }

  /**
   * 캐시 삭제
   */
  async clearCache(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * 로그 출력 (verbose 모드일 때만)
   */
  private log(message: string): void {
    if (this.verbose) {
      console.log(`[ComponentSync] ${message}`);
    }
  }
}

// 편의 함수: 싱글톤 인스턴스
let defaultSyncService: ComponentSyncService | null = null;

export function getComponentSyncService(config?: Partial<GitHubConfig>): ComponentSyncService {
  if (!defaultSyncService) {
    defaultSyncService = new ComponentSyncService(config);
  }
  return defaultSyncService;
}
