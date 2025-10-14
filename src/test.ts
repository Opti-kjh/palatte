#!/usr/bin/env node

import { DesignSystemService } from './services/design-system.js';
import { FigmaService } from './services/figma.js';
import { CodeGenerator } from './services/code-generator.js';

async function testServices() {
  console.log('🧪 Testing Design System MCP Services...\n');

  // Test Design System Service
  console.log('1. Testing Design System Service...');
  const designSystemService = new DesignSystemService();
  
  const reactComponents = await designSystemService.getAvailableComponents('react');
  console.log(`✅ Found ${reactComponents.length} React components`);
  
  const vueComponents = await designSystemService.getAvailableComponents('vue');
  console.log(`✅ Found ${vueComponents.length} Vue components`);
  
  // Test component matching
  const buttonMatch = designSystemService.findBestMatch('button', 'react');
  console.log(`✅ Button match: ${buttonMatch?.name || 'Not found'}`);
  
  const inputMatch = designSystemService.findBestMatch('text-field', 'vue');
  console.log(`✅ Input match: ${inputMatch?.name || 'Not found'}\n`);

  // Test Figma Service (without actual API call)
  console.log('2. Testing Figma Service...');
  const figmaService = new FigmaService();
  
  // Test URL parsing
  try {
    const fileId = figmaService['extractFileId']('https://www.figma.com/file/abc123/Test-File');
    console.log(`✅ URL parsing works: ${fileId}`);
  } catch (error) {
    console.log(`❌ URL parsing failed: ${error}`);
  }

  // Test Code Generator
  console.log('3. Testing Code Generator...');
  const codeGenerator = new CodeGenerator(designSystemService);
  
  // Mock Figma data
  const mockFigmaData = {
    document: {
      id: 'root',
      name: 'Test Component',
      type: 'FRAME',
      children: [
        {
          id: 'button-1',
          name: 'Submit Button',
          type: 'RECTANGLE',
          characters: 'Submit',
          absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 40 },
          cornerRadius: 8,
          fills: [{
            type: 'SOLID',
            color: { r: 0.2, g: 0.4, b: 0.8, a: 1 }
          }]
        }
      ]
    },
    components: {},
    styles: {},
    name: 'Test File',
    lastModified: '2024-01-01',
    thumbnailUrl: ''
  };

  try {
    const reactCode = await codeGenerator.generateReactComponent(mockFigmaData, 'TestComponent');
    console.log('✅ React code generation works');
    console.log('Generated React component preview:');
    console.log(reactCode.split('\n').slice(0, 10).join('\n') + '...\n');

    const vueCode = await codeGenerator.generateVueComponent(mockFigmaData, 'TestComponent');
    console.log('✅ Vue code generation works');
    console.log('Generated Vue component preview:');
    console.log(vueCode.split('\n').slice(0, 10).join('\n') + '...\n');
  } catch (error) {
    console.log(`❌ Code generation failed: ${error}`);
  }

  console.log('🎉 All tests completed!');
}

// Run tests
testServices().catch(console.error);
