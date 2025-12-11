/**
 * Palette MCP Server - Smithery Remote 배포용
 * 
 * Smithery.ai에서 호스팅될 때 사용됩니다.
 * Smithery가 이 파일을 로드하고 createServer 함수를 호출합니다.
 */

import { z } from 'zod';
import { createPaletteServer, tools } from './server.js';

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
 * Smithery에서 호출하는 서버 생성 함수
 * 
 * @param config - Smithery에서 전달받은 사용자 설정
 * @returns MCP 서버 인스턴스
 */
export default function createServer({ config }: { config: SmitheryConfig }) {
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

  console.error('Palette server created for Smithery (Remote mode)');

  // Smithery가 기대하는 형식으로 반환
  return server;
}

// Tools 정보도 export (Smithery가 capabilities 탐지에 사용할 수 있음)
export { tools };
