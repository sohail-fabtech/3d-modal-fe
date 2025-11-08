#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serverFunctionPath = path.join(__dirname, '..', '.open-next', 'server-functions', 'default');
const swcHelpersPath = path.join(serverFunctionPath, 'node_modules', '@swc', 'helpers');

console.log('Fixing @swc/helpers structure...');

if (!fs.existsSync(swcHelpersPath)) {
  console.error('@swc/helpers not found!');
  process.exit(1);
}

// Create the _ folder structure that Next.js expects
const underscorePath = path.join(swcHelpersPath, '_');
const cjsPath = path.join(swcHelpersPath, 'cjs');

if (!fs.existsSync(underscorePath) && fs.existsSync(cjsPath)) {
  console.log('Creating _ folder structure...');
  execSync(`mkdir -p "${underscorePath}"`, { stdio: 'inherit' });
  
  // Copy cjs files to _ folder with .js extension
  const cjsFiles = fs.readdirSync(cjsPath);
  for (const file of cjsFiles) {
    if (file.endsWith('.cjs')) {
      const sourceFile = path.join(cjsPath, file);
      const targetFile = path.join(underscorePath, file.replace('.cjs', '.js'));
      console.log(`Copying ${file} -> ${path.basename(targetFile)}`);
      execSync(`cp "${sourceFile}" "${targetFile}"`, { stdio: 'inherit' });
    }
  }
  
  // Also copy esm files if they exist
  const esmPath = path.join(swcHelpersPath, 'esm');
  if (fs.existsSync(esmPath)) {
    const esmFiles = fs.readdirSync(esmPath);
    for (const file of esmFiles) {
      if (file.endsWith('.js') || file.endsWith('.mjs')) {
        const sourceFile = path.join(esmPath, file);
        const targetFile = path.join(underscorePath, file);
        if (!fs.existsSync(targetFile)) {
          console.log(`Copying ESM ${file}...`);
          execSync(`cp "${sourceFile}" "${targetFile}"`, { stdio: 'inherit' });
        }
      }
    }
  }
  
  console.log('✓ _ folder structure created');
} else if (fs.existsSync(underscorePath)) {
  console.log('✓ _ folder already exists');
}

// Verify the required file exists
const requiredFile = path.join(underscorePath, '_interop_require_default.js');
if (fs.existsSync(requiredFile)) {
  console.log('✓ Required file exists:', requiredFile);
} else {
  console.error('✗ Required file missing:', requiredFile);
  // Try to create it from cjs
  const cjsFile = path.join(cjsPath, '_interop_require_default.cjs');
  if (fs.existsSync(cjsFile)) {
    console.log('Creating from cjs file...');
    execSync(`cp "${cjsFile}" "${requiredFile}"`, { stdio: 'inherit' });
    console.log('✓ Created from cjs');
  }
}

console.log('✓ @swc/helpers structure fixed');

