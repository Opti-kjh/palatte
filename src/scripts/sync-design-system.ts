#!/usr/bin/env node
/**
 * Design System 컴포넌트 동기화 CLI
 *
 * 사용법:
 *   yarn sync:design-system           # 캐시가 유효하면 스킵, 아니면 동기화
 *   yarn sync:design-system --force   # 강제 동기화
 *   yarn sync:design-system --status  # 캐시 상태 확인
 *   yarn sync:design-system --clear   # 캐시 삭제
 *   yarn sync:design-system --verbose # 상세 로그 출력
 */

import { config } from 'dotenv';
config({ override: true });

import { ComponentSyncService } from '../sync/index.js';

interface CLIOptions {
  force: boolean;
  status: boolean;
  clear: boolean;
  verbose: boolean;
  help: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  return {
    force: args.includes('--force') || args.includes('-f'),
    status: args.includes('--status') || args.includes('-s'),
    clear: args.includes('--clear') || args.includes('-c'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

function printHelp(): void {
  console.log(`
Design System 컴포넌트 동기화 CLI

사용법:
  yarn sync:design-system [options]

옵션:
  --force,   -f    캐시를 무시하고 강제 동기화
  --status,  -s    캐시 상태 확인
  --clear,   -c    캐시 삭제
  --verbose, -v    상세 로그 출력
  --help,    -h    도움말 표시

예제:
  yarn sync:design-system              # 일반 동기화
  yarn sync:design-system --force      # 강제 동기화
  yarn sync:design-system --status     # 상태 확인
  yarn sync:design-system -v -f        # 강제 동기화 + 상세 로그

환경 변수:
  GITHUB_TOKEN     GitHub API 토큰 (선택, rate limit 증가용)
`);
}

async function showStatus(syncService: ComponentSyncService): Promise<void> {
  console.log('\n📊 캐시 상태 확인 중...\n');

  const status = await syncService.getCacheStatus();

  if (!status.exists) {
    console.log('❌ 캐시 없음\n');
    console.log('동기화를 실행하여 캐시를 생성하세요:');
    console.log('  yarn sync:design-system\n');
    return;
  }

  console.log('✅ 캐시 존재\n');
  console.log(`버전: ${status.metadata?.version}`);
  console.log(`마지막 동기화: ${status.metadata?.lastSyncedAt}`);
  console.log(`커밋 SHA: ${status.metadata?.commitSha.substring(0, 7)}`);
  console.log(`React 컴포넌트: ${status.metadata?.reactComponentCount}개`);
  console.log(`Vue 컴포넌트: ${status.metadata?.vueComponentCount}개`);
  console.log(`\n캐시 유효성: ${status.isValid ? '✅ 최신' : '⚠️ 업데이트 필요'}\n`);

  if (!status.isValid) {
    console.log('동기화를 실행하여 최신 상태로 업데이트하세요:');
    console.log('  yarn sync:design-system\n');
  }
}

async function clearCache(syncService: ComponentSyncService): Promise<void> {
  console.log('\n🗑️  캐시 삭제 중...\n');
  await syncService.clearCache();
  console.log('✅ 캐시가 삭제되었습니다.\n');
}

async function runSync(
  syncService: ComponentSyncService,
  options: CLIOptions
): Promise<void> {
  console.log('\n🔄 Design System 컴포넌트 동기화\n');

  if (options.force) {
    console.log('⚠️  강제 동기화 모드 (캐시 무시)\n');
  }

  const startTime = Date.now();

  try {
    const result = await syncService.sync({
      force: options.force,
      verbose: options.verbose,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!result.success) {
      console.error('\n❌ 동기화 실패:', result.error);
      process.exit(1);
    }

    console.log('\n✅ 동기화 완료!\n');
    console.log(`소스: ${result.fromCache ? '캐시' : 'GitHub API'}`);
    console.log(`커밋: ${result.commitSha.substring(0, 7)}`);
    console.log(`React 컴포넌트: ${result.reactComponents.length}개`);
    console.log(`Vue 컴포넌트: ${result.vueComponents.length}개`);
    console.log(`소요 시간: ${elapsed}초\n`);

    // 컴포넌트 목록 출력 (verbose 모드)
    if (options.verbose) {
      console.log('📦 React 컴포넌트:');
      result.reactComponents.forEach((c) => {
        console.log(`  - ${c.name} (${c.category}): ${c.props.length} props`);
      });

      console.log('\n📦 Vue 컴포넌트:');
      result.vueComponents.forEach((c) => {
        console.log(`  - ${c.name} (${c.category}): ${c.props.length} props`);
      });
      console.log('');
    }
  } catch (error) {
    console.error('\n❌ 동기화 중 오류 발생:', error);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const syncService = new ComponentSyncService();

  if (options.status) {
    await showStatus(syncService);
    return;
  }

  if (options.clear) {
    await clearCache(syncService);
    return;
  }

  await runSync(syncService, options);
}

main().catch((error) => {
  console.error('CLI 실행 오류:', error);
  process.exit(1);
});
