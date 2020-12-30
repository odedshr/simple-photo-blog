import { compile } from './simple-photo-blog';
import { getConfig } from './config';

console.info('==============================================================');

const config = getConfig(getWorkingDirectory());

if (config) {
  compile(config);
}

console.info('==============================================================');

// ================

function getWorkingDirectory() {
  const path = process.argv[0].split('/');
  path.pop();
  return path.join('/')
}
