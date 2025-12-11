import { existsSync } from 'fs';

// React design-system paths
const reactPaths = [
  'node_modules/@dealicious/design-system-react/src/components/ssm-button',
  'node_modules/@dealicious/design-system-react/src/components/ssm-text',
  'node_modules/@dealicious/design-system-react/src/components/ssm-check',
  'node_modules/@dealicious/design-system-react/src/components/ssm-chip',
  'node_modules/@dealicious/design-system-react/src/components/ssm-tag',
  'node_modules/@dealicious/design-system-react/src/components/ssm-input',
];

// Vue design-system paths (uses PascalCase naming)
const vuePaths = [
  'node_modules/@dealicious/design-system/src/components/SsmButton',
  'node_modules/@dealicious/design-system/src/components/SsmText',
  'node_modules/@dealicious/design-system/src/components/SsmCheck',
];

console.log('Verifying design system installation...\n');
console.log('='.repeat(70));
console.log('React Design System Components:');
console.log('='.repeat(70));

let allExist = true;
reactPaths.forEach(p => {
  const exists = existsSync(p);
  console.log(`${exists ? '✓' : '✗'} ${p}`);
  if (!exists) allExist = false;
});

console.log('\n' + '='.repeat(70));
console.log('Vue Design System Components:');
console.log('='.repeat(70));

vuePaths.forEach(p => {
  const exists = existsSync(p);
  console.log(`${exists ? '✓' : '✗'} ${p}`);
  if (!exists) allExist = false;
});

console.log('\n' + '='.repeat(70));
console.log('Import Tests (using index.ts):');
console.log('='.repeat(70));

// Test imports with explicit index.ts path
try {
  // Note: Using dynamic import with explicit index path
  const buttonModule = await import('@dealicious/design-system-react/src/components/ssm-button/index.ts');
  console.log('✓ React Button: Successfully imported');
  console.log('  Exports:', Object.keys(buttonModule).join(', '));
} catch (e) {
  console.log('✗ React Button import failed:', e.message.split('\n')[0]);
}

try {
  const textModule = await import('@dealicious/design-system-react/src/components/ssm-text/index.ts');
  console.log('✓ React Text: Successfully imported');
} catch (e) {
  console.log('✗ React Text import failed:', e.message.split('\n')[0]);
}

console.log('\n' + '='.repeat(70));

if (allExist) {
  console.log('\n✅ All design system component directories exist!');
  console.log('   The symlinks are working correctly.');
  console.log('\n📝 Note: TypeScript imports may still need path adjustments.');
  console.log('   Check tsconfig.json for proper module resolution.');
} else {
  console.log('\n❌ Some design system components are missing.');
}

console.log('\n');
