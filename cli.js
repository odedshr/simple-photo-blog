#!/usr/bin/env node

const { compile } = require('./dist/simple-photo-blog');
const { getConfig } = require('./dist/config');

execute();

async function execute() {
  console.info('==============================================================');

  const config = getConfig(getWorkingDirectory());

  if (config) {
    await compile(config);
  }

  console.info('==============================================================');
}

function getWorkingDirectory() {
  const [executable, jsFile] = process.argv;

  if (jsFile === '/snapshot/bin/upload.js') {
    const path = executable.split('/');
    path.pop();
    return path.join('/')
  }

  return process.cwd();
}
