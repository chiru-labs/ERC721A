#!/usr/bin/env node
const fs = require('fs');
const glob = require('glob');

// read version from input arg
const version = process.argv[2];
// abort if no version is given
if (!version) {
  console.error('No version specified');
  process.exit(1);
}

// update package.json version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.version = version;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// update package-lock.json version
const packageLockJson = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
packageLockJson.version = version;
packageLockJson.packages[""].version = version;
fs.writeFileSync('package-lock.json', JSON.stringify(packageLockJson, null, 2));

const spdxString = '// SPDX-License-Identifier: MIT';
const versionPrefix = '// ERC721A Contracts v';

// loop through all files with contracts/**/*.sol pattern
glob('contracts/**/*.sol', null, function (err, files) {
  files.forEach((file) => {
    // read file content
    const content = fs.readFileSync(file, 'utf8');

    const versionStringLine = versionPrefix + version;

    let updatedContent;
    if (content.includes(versionPrefix)) {
      updatedContent = content.replace(new RegExp(`${versionPrefix}.*`), `${versionStringLine}`);
    } else {
      updatedContent = content.replace(new RegExp(`${spdxString}`), `${spdxString}\n${versionStringLine}`);
    }

    // write updated file
    fs.writeFileSync(file, updatedContent);
  });
});
