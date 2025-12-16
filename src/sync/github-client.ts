/**
 * GitHub REST API 클라이언트
 * ssm-web 저장소에서 디자인 시스템 컴포넌트 파일을 가져옵니다.
 */

import { Octokit } from '@octokit/rest';

export interface GitHubConfig {
  owner: string;
  repo: string;
  token?: string;
}

export interface FileContent {
  path: string;
  content: string;
  sha: string;
}

export interface CommitInfo {
  sha: string;
  date: string;
}

const DEFAULT_CONFIG: GitHubConfig = {
  owner: 'dealicious-inc',
  repo: 'ssm-web',
};

// 파일 크기 제한 (메모리 보호)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * GitHub REST API를 통해 ssm-web 저장소에 접근하는 클라이언트
 */
export class GitHubClient {
  private octokit: Octokit;
  private config: GitHubConfig;

  constructor(config: Partial<GitHubConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    const token = this.config.token || process.env.GITHUB_TOKEN;
    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * 최신 커밋 SHA 가져오기
   */
  async getLatestCommitSha(branch: string = 'master'): Promise<CommitInfo> {
    try {
      const { data } = await this.octokit.repos.getBranch({
        owner: this.config.owner,
        repo: this.config.repo,
        branch,
      });

      return {
        sha: data.commit.sha,
        date: data.commit.commit.committer?.date || new Date().toISOString(),
      };
    } catch (error) {
      console.warn(`GitHub API: 브랜치 정보 가져오기 실패 (${branch})`, error);
      throw error;
    }
  }

  /**
   * 특정 경로의 파일 목록 가져오기
   */
  async listFiles(path: string, ref?: string): Promise<string[]> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref,
      });

      if (!Array.isArray(data)) {
        return [];
      }

      return data
        .filter((item) => item.type === 'dir')
        .map((item) => item.name);
    } catch (error) {
      console.warn(`GitHub API: 파일 목록 가져오기 실패 (${path})`, error);
      return [];
    }
  }

  /**
   * 파일 내용 가져오기
   */
  async getFileContent(path: string, ref?: string): Promise<FileContent | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref,
      });

      if (Array.isArray(data) || data.type !== 'file') {
        return null;
      }

      // Base64 디코딩 (크기 제한 적용)
      const buffer = Buffer.from(data.content, 'base64');

      if (buffer.length > MAX_FILE_SIZE) {
        console.warn(`파일이 너무 큽니다: ${path} (${buffer.length} bytes, 최대 ${MAX_FILE_SIZE} bytes)`);
        return null;
      }

      const content = buffer.toString('utf-8');

      return {
        path: data.path,
        content,
        sha: data.sha,
      };
    } catch (error) {
      // 404 에러는 파일이 없는 경우이므로 조용히 null 반환
      if ((error as any)?.status === 404) {
        return null;
      }
      console.warn(`GitHub API: 파일 내용 가져오기 실패 (${path})`, error);
      return null;
    }
  }

  /**
   * React 컴포넌트 목록 가져오기
   * packages/design-system-react/src/components 경로의 폴더 목록
   */
  async getReactComponentList(ref?: string): Promise<string[]> {
    const basePath = 'packages/design-system-react/src/components';
    return this.listFiles(basePath, ref);
  }

  /**
   * Vue 컴포넌트 목록 가져오기
   * packages/design-system/src/components 경로의 폴더 목록
   */
  async getVueComponentList(ref?: string): Promise<string[]> {
    const basePath = 'packages/design-system/src/components';
    return this.listFiles(basePath, ref);
  }

  /**
   * React 컴포넌트 소스 코드 가져오기 (Props 정의가 있는 모든 파일 병합)
   */
  async getReactComponentSource(
    componentDir: string,
    ref?: string
  ): Promise<FileContent | null> {
    const basePath = `packages/design-system-react/src/components/${componentDir}`;
    const componentName = this.toPascalCase(componentDir);
    const simpleComponentName = this.toKebabCase(componentName); // accordion

    // 메인 컴포넌트 파일 후보
    const mainFiles = [
      `${basePath}/${componentDir}.tsx`,  // ssm-button.tsx
      `${basePath}/index.tsx`,
      `${basePath}/${componentName}.tsx`,  // SsmButton.tsx
    ];

    // 보조 파일들 (Props 정의가 있을 수 있는 파일들)
    const auxiliaryFiles = [
      `${basePath}/types.ts`,  // ssm-icon, ssm-radio
      `${basePath}/base/${simpleComponentName}.tsx`,  // ssm-accordion/base/accordion.tsx
    ];

    // 메인 파일 찾기
    let mainContent: FileContent | null = null;
    for (const filePath of mainFiles) {
      const content = await this.getFileContent(filePath, ref);
      if (content) {
        mainContent = content;
        break;
      }
    }

    // 보조 파일들의 내용 수집 (Props 정의가 다른 파일에 있을 수 있음)
    const auxiliaryContents: string[] = [];
    for (const filePath of auxiliaryFiles) {
      const content = await this.getFileContent(filePath, ref);
      if (content) {
        auxiliaryContents.push(content.content);
      }
    }

    // 모든 내용 병합
    if (mainContent && auxiliaryContents.length > 0) {
      mainContent = {
        ...mainContent,
        content: auxiliaryContents.join('\n\n') + '\n\n' + mainContent.content,
      };
    } else if (!mainContent && auxiliaryContents.length > 0) {
      // 메인 파일 없이 보조 파일만 있는 경우 (ssm-icon)
      mainContent = {
        path: `${basePath}/types.ts`,
        content: auxiliaryContents.join('\n\n'),
        sha: '',
      };
    }

    return mainContent;
  }

  /**
   * Vue 컴포넌트 소스 코드 가져오기
   */
  async getVueComponentSource(
    componentDir: string,
    ref?: string
  ): Promise<FileContent | null> {
    const basePath = `packages/design-system/src/components/${componentDir}`;

    // 가능한 파일 이름들 (우선순위 순)
    // ssm-web은 kebab-case 파일명 사용 (예: ssm-button.vue)
    const possibleFiles = [
      `${basePath}/${componentDir}.vue`,  // ssm-button.vue (kebab-case)
      `${basePath}/${this.toPascalCase(componentDir)}.vue`,  // SsmButton.vue (PascalCase)
      `${basePath}/index.vue`,
    ];

    for (const filePath of possibleFiles) {
      const content = await this.getFileContent(filePath, ref);
      if (content) {
        return content;
      }
    }

    return null;
  }

  /**
   * API 연결 상태 확인
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rate limit 정보 가져오기
   */
  async getRateLimit(): Promise<{ remaining: number; limit: number; reset: Date }> {
    const { data } = await this.octokit.rateLimit.get();
    return {
      remaining: data.rate.remaining,
      limit: data.rate.limit,
      reset: new Date(data.rate.reset * 1000),
    };
  }

  /**
   * kebab-case를 PascalCase로 변환
   */
  private toPascalCase(str: string): string {
    return str
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  /**
   * PascalCase/kebab-case에서 kebab-case로 변환 (ssm- 접두사 제거)
   */
  private toKebabCase(str: string): string {
    // 이미 kebab-case인 경우 ssm- 접두사 제거
    if (str.includes('-')) {
      return str.replace(/^ssm-/, '');
    }
    // PascalCase를 kebab-case로 변환하고 ssm 제거
    return str
      .replace(/^Ssm/, '')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }
}
