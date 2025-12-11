#!/usr/bin/env node

// .env 파일 로드
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 프로젝트 루트의 .env 파일 로드
dotenv.config({ path: join(__dirname, '..', '.env') });

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import { FigmaService } from './services/figma.js';
import { DesignSystemService } from './services/design-system.js';
import { CodeGenerator, type PreviewType } from './services/code-generator.js';

// MCP 서버 초기화
const server = new Server(
  {
    name: 'palette',
    version: '1.0.0',
  }
);

// Figma 및 Design System 서비스 초기화
const figmaService = new FigmaService();
const designSystemService = new DesignSystemService();
const codeGenerator = new CodeGenerator(designSystemService);

// 사용 가능한 도구 목록
const tools: Tool[] = [
  {
    name: 'convert_figma_to_react',
    description: 'Figma 디자인을 디자인 시스템을 사용하여 React 컴포넌트로 변환합니다',
    inputSchema: {
      type: 'object',
      properties: {
        figmaUrl: {
          type: 'string',
          description: 'Figma 파일 URL 또는 파일 ID',
        },
        nodeId: {
          type: 'string',
          description: '변환할 특정 노드 ID (선택사항)',
        },
        componentName: {
          type: 'string',
          description: '생성할 컴포넌트 이름',
        },
        previewType: {
          type: 'string',
          enum: ['html', 'image', 'both'],
          description: '미리보기 타입: "html"은 HTML 파일, "image"는 PNG 이미지, "both"는 둘 다 (기본값: "both")',
          default: 'both',
        },
      },
      required: ['figmaUrl', 'componentName'],
    },
  },
  {
    name: 'convert_figma_to_vue',
    description: 'Figma 디자인을 디자인 시스템을 사용하여 Vue 컴포넌트로 변환합니다',
    inputSchema: {
      type: 'object',
      properties: {
        figmaUrl: {
          type: 'string',
          description: 'Figma 파일 URL 또는 파일 ID',
        },
        nodeId: {
          type: 'string',
          description: '변환할 특정 노드 ID (선택사항)',
        },
        componentName: {
          type: 'string',
          description: '생성할 컴포넌트 이름',
        },
        previewType: {
          type: 'string',
          enum: ['html', 'image', 'both'],
          description: '미리보기 타입: "html"은 HTML 파일, "image"는 PNG 이미지, "both"는 둘 다 (기본값: "both")',
          default: 'both',
        },
      },
      required: ['figmaUrl', 'componentName'],
    },
  },
  {
    name: 'list_design_system_components',
    description: '디자인 시스템에서 사용 가능한 컴포넌트 목록을 조회합니다',
    inputSchema: {
      type: 'object',
      properties: {
        framework: {
          type: 'string',
          enum: ['react', 'vue'],
          description: '컴포넌트를 조회할 프레임워크',
        },
      },
      required: ['framework'],
    },
  },
  {
    name: 'analyze_figma_file',
    description: 'Figma 파일 구조와 사용 가능한 컴포넌트를 분석합니다',
    inputSchema: {
      type: 'object',
      properties: {
        figmaUrl: {
          type: 'string',
          description: 'Figma 파일 URL 또는 파일 ID',
        },
      },
      required: ['figmaUrl'],
    },
  },
];

// 도구 목록 핸들러
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// 도구 실행 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'convert_figma_to_react': {
        const { figmaUrl, nodeId, componentName, previewType = 'both' } = args as {
          figmaUrl: string;
          nodeId?: string;
          componentName: string;
          previewType?: PreviewType;
        };

        const figmaData = await figmaService.getFigmaData(figmaUrl, nodeId);
        const files = await codeGenerator.generateAndSaveReactComponent(
          figmaData,
          componentName,
          figmaUrl,
          nodeId,
          previewType
        );

        // 결과 메시지 구성
        let fileList = `- 컴포넌트: \`${files.componentFile}\`\n`;
        if (files.htmlFile) {
          fileList += `- HTML 미리보기: \`${files.htmlFile}\`\n`;
        }
        if (files.imageFile) {
          fileList += `- 이미지 미리보기: \`${files.imageFile}\`\n`;
        }
        fileList += `- 메타데이터: \`${files.metadataFile}\``;

        const content: any[] = [
          {
            type: 'text',
            text: `# React Component Generated\n\n**요청 ID:** \`${files.requestId}\`\n**저장 경로:** \`${files.folderPath}\`\n\n## 생성된 파일\n${fileList}\n\n## 컴포넌트 코드\n\n\`\`\`tsx\n${await readFile(files.componentFile, 'utf-8')}\n\`\`\``,
          },
        ];

        // 이미지가 있으면 이미지도 포함
        if (files.imageFile) {
          try {
            const imageBuffer = await readFile(files.imageFile);
            content.push({
              type: 'image',
              data: imageBuffer.toString('base64'),
              mimeType: 'image/png'
            });
          } catch (error) {
            console.warn('이미지 읽기 실패:', error);
          }
        }

        return { content };
      }

      case 'convert_figma_to_vue': {
        const { figmaUrl, nodeId, componentName, previewType = 'both' } = args as {
          figmaUrl: string;
          nodeId?: string;
          componentName: string;
          previewType?: PreviewType;
        };

        const figmaData = await figmaService.getFigmaData(figmaUrl, nodeId);
        const files = await codeGenerator.generateAndSaveVueComponent(
          figmaData,
          componentName,
          figmaUrl,
          nodeId,
          previewType
        );

        // 결과 메시지 구성
        let fileList = `- 컴포넌트: \`${files.componentFile}\`\n`;
        if (files.htmlFile) {
          fileList += `- HTML 미리보기: \`${files.htmlFile}\`\n`;
        }
        if (files.imageFile) {
          fileList += `- 이미지 미리보기: \`${files.imageFile}\`\n`;
        }
        fileList += `- 메타데이터: \`${files.metadataFile}\``;

        const content: any[] = [
          {
            type: 'text',
            text: `# Vue Component Generated\n\n**요청 ID:** \`${files.requestId}\`\n**저장 경로:** \`${files.folderPath}\`\n\n## 생성된 파일\n${fileList}\n\n## 컴포넌트 코드\n\n\`\`\`vue\n${await readFile(files.componentFile, 'utf-8')}\n\`\`\``,
          },
        ];

        // 이미지가 있으면 이미지도 포함
        if (files.imageFile) {
          try {
            const imageBuffer = await readFile(files.imageFile);
            content.push({
              type: 'image',
              data: imageBuffer.toString('base64'),
              mimeType: 'image/png'
            });
          } catch (error) {
            console.warn('이미지 읽기 실패:', error);
          }
        }

        return { content };
      }

      case 'list_design_system_components': {
        const { framework } = args as { framework: 'react' | 'vue' };
        const components = await designSystemService.getAvailableComponents(framework);

        return {
          content: [
            {
              type: 'text',
              text: `# Available ${framework} Components\n\n${components
                .map((comp) => `- **${comp.name}**: ${comp.description}`)
                .join('\n')}`,
            },
          ],
        };
      }

      case 'analyze_figma_file': {
        const { figmaUrl } = args as { figmaUrl: string };
        const analysis = await figmaService.analyzeFigmaFile(figmaUrl);

        return {
          content: [
            {
              type: 'text',
              text: `# Figma File Analysis\n\n${analysis}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
});

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Palette server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
