/**
 * 캐시 매니저
 * 동기화된 컴포넌트 메타데이터를 파일 시스템에 캐시합니다.
 */

import { mkdir, writeFile, readFile, access, rm } from 'fs/promises';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import type { DesignSystemComponent } from '../services/design-system.js';

// ESM과 CJS 모두 호환되는 __dirname 구현
let __dirname_resolved: string;
try {
  const __filename = fileURLToPath(import.meta.url);
  __dirname_resolved = dirname(__filename);
} catch {
  __dirname_resolved = process.cwd();
}

// Zod 스키마 정의 (타입 안전성 보장)
const CacheMetadataSchema = z.object({
  version: z.string(),
  lastSyncedAt: z.string(),
  commitSha: z.string(),
  reactComponentCount: z.number(),
  vueComponentCount: z.number(),
});

export type CacheMetadata = z.infer<typeof CacheMetadataSchema>;

export interface CachedData {
  metadata: CacheMetadata;
  reactComponents: DesignSystemComponent[];
  vueComponents: DesignSystemComponent[];
}

const CACHE_VERSION = '1.0.0';
const PROJECT_ROOT = resolve(__dirname_resolved, '..', '..');

/**
 * 컴포넌트 캐시 매니저
 */
export class CacheManager {
  private cacheDir: string;
  private metadataFile: string;
  private reactCacheFile: string;
  private vueCacheFile: string;

  constructor(cacheDir?: string) {
    // 기본 캐시 디렉토리: 프로젝트 루트/.cache/design-system
    const defaultCache = join(PROJECT_ROOT, '.cache', 'design-system');

    if (cacheDir) {
      // Path traversal 방지: 프로젝트 루트 내에서만 허용
      const resolvedCache = resolve(cacheDir);
      if (!resolvedCache.startsWith(PROJECT_ROOT)) {
        console.warn('캐시 디렉토리는 프로젝트 루트 내에 있어야 합니다. 기본 경로 사용.');
        this.cacheDir = defaultCache;
      } else {
        this.cacheDir = resolvedCache;
      }
    } else {
      this.cacheDir = defaultCache;
    }

    this.metadataFile = join(this.cacheDir, 'metadata.json');
    this.reactCacheFile = join(this.cacheDir, 'react-components.json');
    this.vueCacheFile = join(this.cacheDir, 'vue-components.json');
  }

  /**
   * 캐시 디렉토리 초기화 (race condition 방지)
   */
  async initialize(): Promise<void> {
    try {
      await mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      // EEXIST는 이미 존재하는 경우이므로 무시
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * 캐시 존재 여부 확인
   */
  async exists(): Promise<boolean> {
    try {
      await access(this.metadataFile);
      await access(this.reactCacheFile);
      await access(this.vueCacheFile);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 캐시 메타데이터 읽기 (Zod 스키마 검증)
   */
  async getMetadata(): Promise<CacheMetadata | null> {
    try {
      const content = await readFile(this.metadataFile, 'utf-8');
      const parsed = JSON.parse(content);
      // Zod 스키마로 검증하여 타입 안전성 보장
      return CacheMetadataSchema.parse(parsed);
    } catch {
      return null;
    }
  }

  /**
   * 캐시된 커밋 SHA 가져오기
   */
  async getCachedCommitSha(): Promise<string | null> {
    const metadata = await this.getMetadata();
    return metadata?.commitSha || null;
  }

  /**
   * 캐시가 유효한지 확인 (커밋 SHA 비교)
   */
  async isValid(currentCommitSha: string): Promise<boolean> {
    const cachedSha = await this.getCachedCommitSha();
    if (!cachedSha) {
      return false;
    }

    // 버전 체크
    const metadata = await this.getMetadata();
    if (metadata?.version !== CACHE_VERSION) {
      return false;
    }

    return cachedSha === currentCommitSha;
  }

  /**
   * React 컴포넌트 캐시 읽기
   */
  async getReactComponents(): Promise<DesignSystemComponent[] | null> {
    try {
      const content = await readFile(this.reactCacheFile, 'utf-8');
      return JSON.parse(content) as DesignSystemComponent[];
    } catch {
      return null;
    }
  }

  /**
   * Vue 컴포넌트 캐시 읽기
   */
  async getVueComponents(): Promise<DesignSystemComponent[] | null> {
    try {
      const content = await readFile(this.vueCacheFile, 'utf-8');
      return JSON.parse(content) as DesignSystemComponent[];
    } catch {
      return null;
    }
  }

  /**
   * 모든 캐시 데이터 읽기
   */
  async load(): Promise<CachedData | null> {
    try {
      const [metadata, reactComponents, vueComponents] = await Promise.all([
        this.getMetadata(),
        this.getReactComponents(),
        this.getVueComponents(),
      ]);

      if (!metadata || !reactComponents || !vueComponents) {
        return null;
      }

      return {
        metadata,
        reactComponents,
        vueComponents,
      };
    } catch {
      return null;
    }
  }

  /**
   * 캐시 저장
   */
  async save(
    commitSha: string,
    reactComponents: DesignSystemComponent[],
    vueComponents: DesignSystemComponent[]
  ): Promise<void> {
    await this.initialize();

    const metadata: CacheMetadata = {
      version: CACHE_VERSION,
      lastSyncedAt: new Date().toISOString(),
      commitSha,
      reactComponentCount: reactComponents.length,
      vueComponentCount: vueComponents.length,
    };

    await Promise.all([
      writeFile(this.metadataFile, JSON.stringify(metadata, null, 2), 'utf-8'),
      writeFile(this.reactCacheFile, JSON.stringify(reactComponents, null, 2), 'utf-8'),
      writeFile(this.vueCacheFile, JSON.stringify(vueComponents, null, 2), 'utf-8'),
    ]);

    console.log(`캐시 저장 완료: React ${reactComponents.length}개, Vue ${vueComponents.length}개`);
  }

  /**
   * 캐시 삭제 (race condition 방지)
   */
  async clear(): Promise<void> {
    try {
      // force: true로 ENOENT 에러 무시
      await rm(this.cacheDir, { recursive: true, force: true });
      console.log('캐시가 삭제되었습니다.');
    } catch (error) {
      console.warn('캐시 삭제 실패:', error);
    }
  }

  /**
   * 캐시 상태 정보
   */
  async getStatus(): Promise<{
    exists: boolean;
    metadata: CacheMetadata | null;
    cacheDir: string;
  }> {
    const exists = await this.exists();
    const metadata = exists ? await this.getMetadata() : null;

    return {
      exists,
      metadata,
      cacheDir: this.cacheDir,
    };
  }
}
