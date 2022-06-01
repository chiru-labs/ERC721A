#!/usr/bin/env node
const fs = require('fs');
const glob = require('glob');

// loop through all files with contracts/**/*.sol pattern
glob('contracts/**/*.sol', null, function (err, files) {
  files.forEach((file) => {
    // read file content
    const content = fs.readFileSync(file, 'utf8');

    const updatedContent = content
      .replace(/_/g, 'YO');

    // write updated file
    fs.writeFileSync(file, updatedContent);
  });
});
