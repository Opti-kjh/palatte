/**
 * Palette MCP Server - 공통 로직
 * 
 * Local(stdio) 모드와 Remote(Smithery) 모드에서 공유되는 핵심 기능을 정의합니다.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'fs/promises';
import { FigmaService } from './services/figma.js';
import { DesignSystemService, type SyncConfig } from './services/design-system.js';
import { CodeGenerator, type PreviewType } from './services/code-generator.js';

// 서버 설정 타입
export interface ServerConfig {
  figmaAccessToken?: string;
  githubToken?: string;
  figmaMcpServerUrl?: string;
  /**
   * Figma Desktop MCP 클라이언트 사용 여부
   * Remote 모드(Smithery)에서는 false로 설정해야 함 (로컬호스트 접근 불가)
   */
  useFigmaMcp?: boolean;
  /**
   * 디자인 시스템 컴포넌트 동기화 설정
   */
  syncConfig?: SyncConfig;
}

// Tools 정의 (annotations 포함)
export const tools: Tool[] = [
  {
    name: 'convert_figma_to_react',
    description: 'Figma 디자인을 @dealicious/design-system-react 컴포넌트를 사용하여 React 컴포넌트로 변환합니다. Figma 파일 URL과 컴포넌트 이름을 제공하면, 디자인 시스템 컴포넌트(Button, Text, Tag, Check, Chip 등)를 활용한 React TSX 코드를 생성합니다.',
    annotations: {
      title: 'Figma to React Converter',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        figmaUrl: {
          type: 'string',
          description: 'Figma 파일의 전체 URL (예: https://www.figma.com/file/ABC123/Design?node-id=1-2) 또는 파일 ID',
        },
        nodeId: {
          type: 'string',
          description: '변환할 특정 Figma 노드의 ID. URL에 node-id가 포함되어 있으면 생략 가능합니다.',
        },
        componentName: {
          type: 'string',
          description: '생성될 React 컴포넌트의 이름 (예: ProductCard, LoginForm)',
        },
        previewType: {
          type: 'string',
          enum: ['html', 'image', 'both'],
          description: '미리보기 생성 옵션: "html"은 브라우저에서 볼 수 있는 HTML 파일, "image"는 PNG 스크린샷, "both"는 둘 다 생성 (기본값: "both")',
          default: 'both',
        },
      },
      required: ['figmaUrl', 'componentName'],
    },
  },
  {
    name: 'convert_figma_to_vue',
    description: 'Figma 디자인을 @dealicious/design-system Vue 컴포넌트를 사용하여 Vue 3 Single File Component로 변환합니다. Figma 파일 URL과 컴포넌트 이름을 제공하면, 디자인 시스템 컴포넌트를 활용한 Vue SFC 코드를 생성합니다.',
    annotations: {
      title: 'Figma to Vue Converter',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        figmaUrl: {
          type: 'string',
          description: 'Figma 파일의 전체 URL (예: https://www.figma.com/file/ABC123/Design?node-id=1-2) 또는 파일 ID',
        },
        nodeId: {
          type: 'string',
          description: '변환할 특정 Figma 노드의 ID. URL에 node-id가 포함되어 있으면 생략 가능합니다.',
        },
        componentName: {
          type: 'string',
          description: '생성될 Vue 컴포넌트의 이름 (예: ProductCard, LoginForm)',
        },
        previewType: {
          type: 'string',
          enum: ['html', 'image', 'both'],
          description: '미리보기 생성 옵션: "html"은 브라우저에서 볼 수 있는 HTML 파일, "image"는 PNG 스크린샷, "both"는 둘 다 생성 (기본값: "both")',
          default: 'both',
        },
      },
      required: ['figmaUrl', 'componentName'],
    },
  },
  {
    name: 'list_design_system_components',
    description: '@dealicious/design-system에서 사용 가능한 모든 UI 컴포넌트 목록을 조회합니다. 각 컴포넌트의 이름, 설명, import 경로, 사용 가능한 props를 반환합니다.',
    annotations: {
      title: 'Design System Component List',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        framework: {
          type: 'string',
          enum: ['react', 'vue'],
          description: '컴포넌트를 조회할 프레임워크: "react"는 design-system-react, "vue"는 design-system 패키지',
        },
      },
      required: ['framework'],
    },
  },
  {
    name: 'analyze_figma_file',
    description: 'Figma 파일의 구조를 분석하여 페이지, 프레임, 컴포넌트 계층을 파악합니다. 변환하기 전에 파일 구조를 이해하는 데 유용합니다.',
    annotations: {
      title: 'Figma File Analyzer',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        figmaUrl: {
          type: 'string',
          description: '분석할 Figma 파일의 전체 URL 또는 파일 ID',
        },
      },
      required: ['figmaUrl'],
    },
  },
];

// Prompts 정의
const prompts = [
  {
    name: 'convert-design-to-component',
    description: 'Figma 디자인을 React 또는 Vue 컴포넌트로 변환하는 가이드 프롬프트',
    arguments: [
      {
        name: 'figmaUrl',
        description: 'Figma 파일 URL',
        required: true,
      },
      {
        name: 'framework',
        description: '프레임워크 선택 (react 또는 vue)',
        required: true,
      },
      {
        name: 'componentName',
        description: '컴포넌트 이름',
        required: true,
      },
    ],
  },
  {
    name: 'explore-design-system',
    description: '디자인 시스템 컴포넌트 탐색 가이드',
    arguments: [
      {
        name: 'framework',
        description: '프레임워크 선택 (react 또는 vue)',
        required: false,
      },
    ],
  },
];

// Resources 정의
const resources = [
  {
    uri: 'palette://design-system/react/components',
    name: 'React Design System Components',
    description: '@dealicious/design-system-react에서 사용 가능한 컴포넌트 목록',
    mimeType: 'application/json',
  },
  {
    uri: 'palette://design-system/vue/components',
    name: 'Vue Design System Components',
    description: '@dealicious/design-system에서 사용 가능한 컴포넌트 목록',
    mimeType: 'application/json',
  },
];

/**
 * MCP 서버를 생성하고 핸들러를 등록합니다.
 * Local 모드와 Remote 모드에서 공통으로 사용됩니다.
 */
export function createPaletteServer(config: ServerConfig = {}): Server {
  // 환경변수에서 설정 읽기 (config가 우선)
  if (config.figmaAccessToken) {
    process.env.FIGMA_ACCESS_TOKEN = config.figmaAccessToken;
  }
  if (config.githubToken) {
    process.env.GITHUB_TOKEN = config.githubToken;
  }
  if (config.figmaMcpServerUrl) {
    process.env.FIGMA_MCP_SERVER_URL = config.figmaMcpServerUrl;
  }

  // MCP 서버 초기화 (모든 capabilities 활성화)
  const server = new Server(
    {
      name: 'palette',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},      // tools 기능 활성화
        prompts: {},    // prompts 기능 활성화
        resources: {},  // resources 기능 활성화
      },
    }
  );

  // 서비스 초기화
  // Remote 모드에서는 Figma Desktop MCP 클라이언트를 사용하지 않음 (로컬호스트 접근 불가)
  const useFigmaMcp = config.useFigmaMcp !== undefined ? config.useFigmaMcp : true;
  const figmaService = new FigmaService(useFigmaMcp, config.figmaMcpServerUrl);
  const designSystemService = new DesignSystemService(config.syncConfig);
  const codeGenerator = new CodeGenerator(designSystemService);

  // 디자인 시스템 컴포넌트 비동기 초기화 (백그라운드에서 실행)
  designSystemService.initialize().catch((error) => {
    console.error('[Palette] 디자인 시스템 초기화 실패:', error);
  });

  // ===== Tools 핸들러 =====
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

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

  // ===== Prompts 핸들러 =====
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return { prompts };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'convert-design-to-component': {
        const figmaUrl = args?.figmaUrl || '<FIGMA_URL>';
        const framework = args?.framework || 'react';
        const componentName = args?.componentName || 'MyComponent';

        return {
          description: 'Figma 디자인을 컴포넌트로 변환하는 프롬프트',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Figma 디자인을 ${framework} 컴포넌트로 변환해주세요.\n\n- Figma URL: ${figmaUrl}\n- 컴포넌트 이름: ${componentName}\n\n디자인 시스템 컴포넌트를 최대한 활용해주세요.`,
              },
            },
          ],
        };
      }

      case 'explore-design-system': {
        const framework = args?.framework || 'react';

        return {
          description: '디자인 시스템 탐색 프롬프트',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `@dealicious/design-system${framework === 'react' ? '-react' : ''} 패키지에서 사용 가능한 컴포넌트 목록을 보여주세요. 각 컴포넌트의 사용법과 예제도 함께 알려주세요.`,
              },
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  });

  // ===== Resources 핸들러 =====
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return { resources };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    switch (uri) {
      case 'palette://design-system/react/components': {
        const components = await designSystemService.getAvailableComponents('react');
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(components, null, 2),
            },
          ],
        };
      }

      case 'palette://design-system/vue/components': {
        const components = await designSystemService.getAvailableComponents('vue');
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(components, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  });

  return server;
}
