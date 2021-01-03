import { compile } from './simple-photo-blog';
import { getConfig } from './config';

execute();

// ================

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

  if (jsFile === '/snapshot/dist/index.js') {
    const path = executable.split('/');
    path.pop();
    return path.join('/')
  }

  return process.cwd();
}
