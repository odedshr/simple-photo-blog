import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export type Config = {
  source: string;
  target: string;
  indexTemplate: string;
  postTemplate: string;
  overwrite: boolean;
  order: 'ascending' | 'descending';
  versionFile?: string;
  execute: string;
  cwd: string;
};

const defaultConfig: Config = {
  cwd: '.',
  source: 'src',
  target: 'www',
  indexTemplate: 'src/index-template.html',
  postTemplate: 'src/post-template.html',
  order: 'ascending',
  overwrite: false,
  execute: ''
}

export function getConfig(): Config | false {
  const cwd = getWorkingDirectory();
  const configFile = join(cwd, 'blog-config.yaml');

  if (!existsSync(configFile)) {
    console.error(' ⚠️  config.yaml missing, creating a default file');
    writeFileSync(configFile, toYaml(defaultConfig), 'utf-8');
  }

  let config = { ...defaultConfig, ...fromYaml(readFileSync(configFile, 'utf-8')) }

  config = {
    ...config,
    cwd,
    source: join(cwd, config.source),
    target: join(cwd, config.target),
    indexTemplate: join(cwd, config.indexTemplate),
    postTemplate: join(cwd, config.postTemplate),
    overwrite: (config.overwrite as unknown as string) === 'true' || config.overwrite === true,
    versionFile: config.versionFile ? join(cwd, config.versionFile) : undefined
  }

  return validateConfig(config) ? config : false;
}

function getWorkingDirectory() {
  const path = process.argv[0].split('/');
  path.pop();
  return path.join('/')
}

function toYaml(config: Config): string {
  return Object.keys(config).map((key: string) => `${key}: ${
    //@ts-ignore
    config[key]
    }`).join('\n');
}

function fromYaml(fileContent: string): Config {
  let config: any = {}
  fileContent.split('\n').map((line: string) => {
    if (!line.length) {
      return;
    }

    try {
      //@ts-ignore
      const [, key, value] = line.match(/^(\w*): (.*)/);
      config[key] = value;
    }
    catch (err) {
      console.error(` ⚠️  Error parsing the config line '${line}': ${err}`);
    }
  });
  return config as Config;
}

function validateConfig(config: Config) {
  if (!existsSync(config.source)) {
    console.error(` 🛑 Source folder doesn't not exists: ${config.source}`);
    return false;
  }

  if (!existsSync(config.target)) {
    console.info(` ⚠️  Creating target folder: ${config.target}`);
    mkdirSync(config.target);
  }

  if (!existsSync(config.indexTemplate)) {
    console.info(` ⚠️  Creating index template: ${config.target}`);
    writeFileSync(config.indexTemplate, getDefaultIndexTemplate(), 'utf-8');
  }

  if (!existsSync(config.postTemplate)) {
    console.info(` ⚠️  Creating post template: ${config.target}`);
    writeFileSync(config.postTemplate, getDefaultPostTemplate(), 'utf-8');
  }

  return true;
}

function getDefaultIndexTemplate() {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1024, initial-scale=1.0">
  <title>My Simple Photo Blog</title>
</head>

<body><ul class="posts"><!-- content --></ul></body>

</html>`;
}

function getDefaultPostTemplate() {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><!-- title --></title>
</head>

<body>
  <h2><!-- title --></h2>
  <div class="pubDate">Published on
    <!-- pubDate -->
  </div>
  <ul class="tags">
    <!-- tags -->
  </ul>
  <main>
    <!-- content -->
  </main>
</body>

</html>`;
}