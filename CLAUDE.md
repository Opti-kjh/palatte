# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Palette is an MCP (Model Context Protocol) server that converts Figma designs to React/Vue components using the Dealicious Design System. It acts as a bridge between Figma and code generation, ensuring all generated components use the internal design system.

## Common Commands

```bash
# Install dependencies
yarn install

# Build the project
yarn build

# Start the MCP server
yarn start

# Development mode (with hot reload)
yarn dev

# Run tests
yarn test

# Test services
yarn test:services

# Test Figma tools
yarn test:figma-tools

# Test MCP servers
yarn test:mcp-servers
```

## Architecture

```
src/
├── index.ts                    # MCP server entry point - defines tools and handlers
├── services/
│   ├── figma.ts               # Figma data fetching (MCP-first with REST API fallback)
│   ├── design-system.ts       # Design system component registry and mapping
│   └── code-generator.ts      # React/Vue code generation with preview
└── utils/
    ├── figma-mcp-client.ts    # Figma Desktop MCP client
    └── request-manager.ts     # Request ID and file management
```

### MCP Tools

The server exposes four tools:
- `convert_figma_to_react` - Convert Figma design to React component
- `convert_figma_to_vue` - Convert Figma design to Vue component
- `list_design_system_components` - List available design system components
- `analyze_figma_file` - Analyze Figma file structure

### Data Flow

1. **Figma Data Fetching**: `FigmaService` fetches data via Figma Desktop MCP (priority) or REST API (fallback)
2. **Component Mapping**: `DesignSystemService` maps Figma nodes to design system components
3. **Code Generation**: `CodeGenerator` produces React/Vue code with HTML/image previews

## Critical Rules

### Rule 1: Figma Access via MCP Only

When working with Figma data:
- **MUST USE**: `list_mcp_resources` or `fetch_mcp_resource` tools
- **NEVER**: Direct Figma API calls (`fetch('https://api.figma.com/...')`)
- **NEVER**: Ask users to copy/paste from Figma

### Rule 2: Design System Components Only

Generated code must use `@dealicious/design-system-react` or `@dealicious/design-system`:

```typescript
// Correct
import { Button } from '@dealicious/design-system-react/src/components/ssm-button';

// Never use
// - Tailwind CSS classes
// - Raw HTML elements (<button>, <input>)
// - Other UI libraries (MUI, Ant Design)
```

### Design System Component Categories

- **Basic**: Button, Text, Input, Dropdown, Icon
- **Forms**: Check, Radio, Switch, TextField
- **Display**: Tag, Chip, Badge, Tooltip
- **Feedback**: Toast, Notice, Error, HelperText, LoadingSpinner
- **Layout**: LayerPopup, LayerAlert, Accordion, Tab
- **Navigation**: Pagination, ArrowPagination, TextLink

### Figma to Component Mapping

| Figma Element | Design System Component |
|--------------|------------------------|
| Button | `ssm-button` |
| Text | `ssm-text` |
| Input Field | `ssm-input` |
| Checkbox | `ssm-check` |
| Radio | `ssm-radio` |
| Dropdown | `ssm-dropdown` |
| Tag/Label | `ssm-tag` |
| Chip | `ssm-chip` |
| Icon | `ssm-icon` |

## Environment Variables

```env
FIGMA_ACCESS_TOKEN=<your_figma_token>      # Required for REST API fallback
FIGMA_MCP_SERVER_URL=http://127.0.0.1:3845/mcp  # Figma Desktop MCP
USE_FIGMA_MCP=true                          # Enable MCP (default)
```

## Code Generation Workflow

1. Fetch Figma data via MCP/REST API
2. Analyze node structure and map to design system components
3. Generate component code with proper imports from design system
4. Create HTML preview (for browser viewing)
5. Generate PNG preview using Puppeteer
6. Save all files with metadata
