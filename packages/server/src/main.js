'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const fs = require('fs');

async function loadModule(name) {
  if (
    !fs.existsSync('./node_modules') ||
    !fs.existsSync('./package-lock.json')
  ) {
    var child_process = require('child_process');
    child_process.execSync('npm install');
  } else {
  }

  const myModule = require(name);
}

loadModule('./index.js');
