const { exec } = require('child_process');

console.log('Testing build process...');

exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Build failed: ${error}`);
    return;
  }
  console.log('Build output:', stdout);
  console.error('Build errors:', stderr);
  
  // Check if build directory exists
  const fs = require('fs');
  if (fs.existsSync('./build')) {
    console.log('Build directory created successfully');
    const files = fs.readdirSync('./build');
    console.log('Build files:', files);
  } else {
    console.log('Build directory not found');
  }
});