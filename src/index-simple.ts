#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

// MCP 서버 초기화
const server = new Server(
  {
    name: 'design-system-mcp',
    version: '1.0.0',
  }
);

// 사용 가능한 도구 목록
const tools: Tool[] = [
  {
    name: 'convert_figma_to_react',
    description: 'Convert Figma design to React component using existing design system',
    inputSchema: {
      type: 'object',
      properties: {
        figmaUrl: {
          type: 'string',
          description: 'Figma file URL or file ID',
        },
        componentName: {
          type: 'string',
          description: 'Name for the generated component',
        },
      },
      required: ['figmaUrl', 'componentName'],
    },
  },
  {
    name: 'convert_figma_to_vue',
    description: 'Convert Figma design to Vue component using existing design system',
    inputSchema: {
      type: 'object',
      properties: {
        figmaUrl: {
          type: 'string',
          description: 'Figma file URL or file ID',
        },
        componentName: {
          type: 'string',
          description: 'Name for the generated component',
        },
      },
      required: ['figmaUrl', 'componentName'],
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
        const { figmaUrl, componentName } = args as {
          figmaUrl: string;
          componentName: string;
        };

        // 간단한 React 컴포넌트 생성
        const reactCode = `import React from 'react';

interface ${componentName}Props {
  // Add your props here
}

const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <div className="${componentName.toLowerCase()}">
      <h1>Generated from Figma: ${figmaUrl}</h1>
      <p>This component was generated from your Figma design.</p>
    </div>
  );
};

export default ${componentName};`;

        return {
          content: [
            {
              type: 'text',
              text: `# React Component Generated\n\n\`\`\`tsx\n${reactCode}\n\`\`\``,
            },
          ],
        };
      }

      case 'convert_figma_to_vue': {
        const { figmaUrl, componentName } = args as {
          figmaUrl: string;
          componentName: string;
        };

        // 간단한 Vue 컴포넌트 생성
        const vueCode = `<template>
  <div class="${componentName.toLowerCase()}">
    <h1>Generated from Figma: ${figmaUrl}</h1>
    <p>This component was generated from your Figma design.</p>
  </div>
</template>

<script setup lang="ts">
// Add your reactive data and methods here
</script>

<style scoped>
.${componentName.toLowerCase()} {
  /* Add your styles here */
}
</style>`;

        return {
          content: [
            {
              type: 'text',
              text: `# Vue Component Generated\n\n\`\`\`vue\n${vueCode}\n\`\`\``,
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
  console.error('Design System MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
