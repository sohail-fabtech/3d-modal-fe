#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serverFunctionPath = path.join(__dirname, '..', '.open-next', 'server-functions', 'default');
const nodeModulesPath = path.join(serverFunctionPath, 'node_modules');

console.log('Preparing Lambda package...');
console.log('Server function path:', serverFunctionPath);

if (!fs.existsSync(serverFunctionPath)) {
  console.error('Server function path does not exist!');
  process.exit(1);
}

// Find @swc/helpers in pnpm structure
const findSwcHelpers = () => {
  const pnpmPath = path.join(nodeModulesPath, '.pnpm');
  if (!fs.existsSync(pnpmPath)) return null;
  
  const entries = fs.readdirSync(pnpmPath);
  for (const entry of entries) {
    if (entry.startsWith('@swc+helpers')) {
      const fullPath = path.join(pnpmPath, entry, 'node_modules', '@swc', 'helpers');
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
  }
  return null;
};

// Copy @swc/helpers to node_modules if it doesn't exist
const swcHelpersPath = path.join(nodeModulesPath, '@swc', 'helpers');
const swcHelpersSource = findSwcHelpers();

if (swcHelpersSource && !fs.existsSync(swcHelpersPath)) {
  console.log('Copying @swc/helpers from pnpm structure...');
  execSync(`mkdir -p ${path.dirname(swcHelpersPath)}`, { stdio: 'inherit' });
  execSync(`cp -r "${swcHelpersSource}" "${swcHelpersPath}"`, { stdio: 'inherit' });
  console.log('✓ @swc/helpers copied');
} else if (swcHelpersSource && fs.existsSync(swcHelpersPath)) {
  // Ensure it's not a symlink and has all files
  const stats = fs.lstatSync(swcHelpersPath);
  if (stats.isSymbolicLink()) {
    console.log('Replacing @swc/helpers symlink with actual files...');
    fs.unlinkSync(swcHelpersPath);
    execSync(`cp -r "${swcHelpersSource}" "${swcHelpersPath}"`, { stdio: 'inherit' });
    console.log('✓ @swc/helpers replaced');
  }
}

// Flatten ALL packages from .pnpm - this is critical for Lambda
console.log('Flattening all packages from .pnpm structure...');
const pnpmPath = path.join(nodeModulesPath, '.pnpm');
if (fs.existsSync(pnpmPath)) {
  const pnpmEntries = fs.readdirSync(pnpmPath);
  let flattenedCount = 0;
  
  for (const entry of pnpmEntries) {
    // Skip if it's not a package directory
    if (!entry.includes('@') && !entry.match(/^[a-z]/)) continue;
    
    const pnpmPackagePath = path.join(pnpmPath, entry);
    if (!fs.statSync(pnpmPackagePath).isDirectory()) continue;
    
    const nodeModulesInPnpm = path.join(pnpmPackagePath, 'node_modules');
    if (!fs.existsSync(nodeModulesInPnpm)) continue;
    
    // Get all packages in this .pnpm entry
    const packages = fs.readdirSync(nodeModulesInPnpm, { withFileTypes: true });
    
    for (const pkg of packages) {
      if (!pkg.isDirectory()) continue;
      
      const pkgName = pkg.name;
      const sourcePath = path.join(nodeModulesInPnpm, pkgName);
      
      // Determine target path
      let targetPath;
      if (pkgName.startsWith('@')) {
        // Scoped package like @next/env
        const parts = pkgName.split('/');
        if (parts.length === 2) {
          targetPath = path.join(nodeModulesPath, parts[0], parts[1]);
        } else if (parts.length === 1) {
          // Just @scope, check if it has subdirectories
          const scopePath = path.join(nodeModulesPath, parts[0]);
          if (!fs.existsSync(scopePath)) {
            execSync(`mkdir -p "${scopePath}"`, { stdio: 'inherit' });
          }
          // Copy all subdirectories
          const subdirs = fs.readdirSync(sourcePath, { withFileTypes: true });
          for (const subdir of subdirs) {
            if (subdir.isDirectory()) {
              const subTargetPath = path.join(scopePath, subdir.name);
              if (!fs.existsSync(subTargetPath) || fs.lstatSync(subTargetPath).isSymbolicLink()) {
                console.log(`Flattening: ${pkgName}/${subdir.name}`);
                if (fs.existsSync(subTargetPath)) {
                  fs.unlinkSync(subTargetPath);
                }
                execSync(`cp -r "${path.join(sourcePath, subdir.name)}" "${subTargetPath}"`, { stdio: 'inherit' });
                flattenedCount++;
              }
            }
          }
          continue;
        } else {
          // Just @scope without name, skip
          continue;
        }
      } else {
        // Regular package
        targetPath = path.join(nodeModulesPath, pkgName);
      }
      
      // Only copy if target doesn't exist or is a symlink
      if (!fs.existsSync(targetPath) || fs.lstatSync(targetPath).isSymbolicLink()) {
        console.log(`Flattening: ${pkgName}`);
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
        }
        execSync(`mkdir -p ${path.dirname(targetPath)}`, { stdio: 'inherit' });
        execSync(`cp -r "${sourcePath}" "${targetPath}"`, { stdio: 'inherit' });
        flattenedCount++;
      }
    }
  }
  
  console.log(`✓ Flattened ${flattenedCount} packages from .pnpm`);
}

// Resolve any remaining symlinks
console.log('Resolving remaining symlinks...');
if (fs.existsSync(nodeModulesPath)) {
  const entries = fs.readdirSync(nodeModulesPath, { withFileTypes: true });
  let resolvedCount = 0;
  
  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      const linkPath = path.join(nodeModulesPath, entry.name);
      const targetPath = fs.readlinkSync(linkPath);
      const resolvedPath = path.resolve(nodeModulesPath, targetPath);
      
      if (fs.existsSync(resolvedPath) && !resolvedPath.includes('.pnpm')) {
        console.log(`Resolving symlink: ${entry.name}`);
        fs.unlinkSync(linkPath);
        execSync(`cp -r "${resolvedPath}" "${linkPath}"`, { stdio: 'inherit' });
        resolvedCount++;
      }
    } else if (entry.isDirectory() && entry.name.startsWith('@')) {
      // Handle scoped packages like @next, @swc
      const scopedPath = path.join(nodeModulesPath, entry.name);
      const scopedEntries = fs.readdirSync(scopedPath, { withFileTypes: true });
      
      for (const scopedEntry of scopedEntries) {
        if (scopedEntry.isSymbolicLink()) {
          const scopedLinkPath = path.join(scopedPath, scopedEntry.name);
          const scopedTarget = fs.readlinkSync(scopedLinkPath);
          const scopedResolved = path.resolve(scopedPath, scopedTarget);
          
          if (fs.existsSync(scopedResolved) && !scopedResolved.includes('.pnpm')) {
            console.log(`Resolving scoped symlink: ${entry.name}/${scopedEntry.name}`);
            fs.unlinkSync(scopedLinkPath);
            execSync(`cp -r "${scopedResolved}" "${scopedLinkPath}"`, { stdio: 'inherit' });
            resolvedCount++;
          }
        }
      }
    }
  }
  
  if (resolvedCount > 0) {
    console.log(`✓ Resolved ${resolvedCount} symlinks`);
  }
}

console.log('✓ Lambda package prepared');
