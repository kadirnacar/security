import { existsSync } from 'fs';
import { createRequire } from 'module';

async function loadMyModule(name) {
  if (!existsSync('./node_modules')) {
    console.log('not load');
    var child_process = require('child_process');
    child_process.execSync('npm install', { stdio: [0, 1, 2] });
  } else {
    console.log(' load');
  }

  const myModule = require(name);
  console.log(myModule);
  // ... use myModule
}

loadMyModule('./index2.js');
