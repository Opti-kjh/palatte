#!/usr/bin/env node

/**
 * Palette MCP Server - Local 실행 모드
 * 
 * npx palette-mcp 또는 직접 실행 시 사용됩니다.
 * stdio transport를 사용하여 MCP 클라이언트와 통신합니다.
 */

// .env 파일 로드
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 프로젝트 루트의 .env 파일 로드
dotenv.config({ path: join(__dirname, '..', '.env') });

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createPaletteServer } from './server.js';

// 서버 시작 (Local 모드)
async function main() {
  // 환경변수에서 설정 읽기
  const server = createPaletteServer({
    figmaAccessToken: process.env.FIGMA_ACCESS_TOKEN,
    githubToken: process.env.GITHUB_TOKEN,
    figmaMcpServerUrl: process.env.FIGMA_MCP_SERVER_URL,
  });

  // stdio transport로 연결
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Palette server running on stdio (Local mode)');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
