/**
 * Palette MCP Server - Smithery Remote 배포용
 * 
 * Smithery.ai에서 호스팅될 때 사용됩니다.
 * @smithery/sdk를 사용하여 HTTP 서버로 실행됩니다.
 */

import { createStatelessServer } from '@smithery/sdk/server/stateless.js';
import { z } from 'zod';
import { createPaletteServer } from './server.js';

// Smithery 설정 스키마 정의
export const configSchema = z.object({
  FIGMA_ACCESS_TOKEN: z
    .string()
    .describe('Figma Personal Access Token (https://www.figma.com/developers/api#access-tokens)'),
  GITHUB_TOKEN: z
    .string()
    .describe('GitHub Personal Access Token for design system packages'),
  FIGMA_MCP_SERVER_URL: z
    .string()
    .default('http://127.0.0.1:3845/mcp')
    .describe('Figma Dev Mode MCP server URL'),
});

// Smithery 설정 타입
type SmitheryConfig = z.infer<typeof configSchema>;

/**
 * MCP 서버 생성 함수 - Smithery가 호출
 */
export default function createMcpServer({ config }: { config: SmitheryConfig }) {
  // 환경변수 설정
  process.env.FIGMA_ACCESS_TOKEN = config.FIGMA_ACCESS_TOKEN;
  process.env.GITHUB_TOKEN = config.GITHUB_TOKEN;
  process.env.FIGMA_MCP_SERVER_URL = config.FIGMA_MCP_SERVER_URL;

  // 공통 서버 생성 로직 사용
  const server = createPaletteServer({
    figmaAccessToken: config.FIGMA_ACCESS_TOKEN,
    githubToken: config.GITHUB_TOKEN,
    figmaMcpServerUrl: config.FIGMA_MCP_SERVER_URL,
  });

  console.error('Palette MCP server created for Smithery (Remote mode)');

  return server;
}

// 직접 실행 시에만 서버 시작 (Smithery에서 import할 때는 실행 안됨)
// Smithery는 createStatelessServer를 내부적으로 호출함
if (process.env.SMITHERY_STANDALONE === 'true') {
  const { app } = createStatelessServer(createMcpServer);
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.error(`Palette MCP server listening on port ${port}`);
  });
}
