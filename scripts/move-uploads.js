const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.cwd(), 'uploads', 'kyc');
const destDir = path.join(process.cwd(), 'public', 'uploads', 'kyc');

// Create destination directory
fs.mkdirSync(destDir, { recursive: true });

console.log('=== Moving uploaded files to public folder ===\n');

if (fs.existsSync(sourceDir)) {
  // Copy all files recursively
  const copyRecursive = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${srcPath} -> ${destPath}`);
      }
    }
  };

  copyRecursive(sourceDir, destDir);
  console.log('\n✅ Files moved successfully');
} else {
  console.log('❌ Source uploads/kyc folder not found');
}

// List files in public/uploads/kyc
console.log('\n=== Files in public/uploads/kyc ===');
const listRecursive = (dir, prefix = '') => {
  if (!fs.existsSync(dir)) {
    console.log('Directory does not exist');
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      console.log(`${prefix}📁 ${entry.name}/`);
      listRecursive(fullPath, prefix + '  ');
    } else {
      const stats = fs.statSync(fullPath);
      console.log(`${prefix}📄 ${entry.name} (${stats.size} bytes)`);
    }
  }
};

listRecursive(destDir);
