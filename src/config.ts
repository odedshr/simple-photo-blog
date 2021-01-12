import { existsSync, readFileSync, mkdirSync, writeFileSync, lstatSync } from 'fs';
import { join } from 'path';

import { Config } from './models/Config';

const defaultConfig: Partial<Config> = {
  blogTitle: 'My Photo Blog',
  source: 'src',
  target: 'www',
  indexTemplate: 'src/index-template.html',
  postTemplate: 'src/post-template.html',
  order: 'ascending',
  maxImageDimension: 0,
  //@ts-ignore
  executeExample: 'git add . && git commit - a - m "💬 blog update `date`" && git push'
}

export function getConfig(cwd: string): Config | false {
  const configFile = join(cwd, 'blog-config.yaml');

  if (!existsSync(configFile)) {
    console.error(' ⚠️  config.yaml missing, creating a default file');
    mkdirSync(cwd, { recursive: true });
    writeFileSync(configFile, toYaml(defaultConfig), 'utf-8');
  }

  let config: Config = { ...defaultConfig, ...fromYaml(readFileSync(configFile, 'utf-8')) };
  const indexTemplate = join(cwd, config.indexTemplate);
  const postTemplate = join(cwd, config.postTemplate)

  config = {
    blogTitle: config.blogTitle || 'My photo blog',
    modified: new Date(),
    cwd,
    source: join(cwd, config.source),
    target: join(cwd, config.target),
    indexTemplate,
    postTemplate,
    maxImageDimension: +config.maxImageDimension || 0,
    versionFile: config.versionFile ? join(cwd, config.versionFile) : undefined,
    order: config.order,
    execute: config.execute
  }

  return validateConfig(config) ? {
    ...config,
    modified: getLatestFileModify(indexTemplate, postTemplate, configFile)
  } : false;
}

function getLatestFileModify(...files: string[]) {
  return new Date(Math.max(...files.map(file => lstatSync(file).mtime.getTime())));
}

function toYaml(config: Partial<Config>): string {
  return Object.keys(config).map((key: string) => `${key}: ${
    //@ts-ignore
    config[key]
    }`).join('\n');
}

function fromYaml(fileContent: string): Config {
  let config: any = {}
  fileContent.split('\n').map((line: string) => {
    if (!line.trim().length) {
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
    console.error(` ⚠️  Creating target folder: ${config.target}`);
    mkdirSync(config.target);
  }

  if (!existsSync(config.indexTemplate)) {
    console.error(` ⚠️  Creating index template: ${config.indexTemplate}`);
    writeFileSync(config.indexTemplate, getDefaultIndexTemplate(), 'utf-8');
  }

  if (!existsSync(config.postTemplate)) {
    console.error(` ⚠️  Creating post template: ${config.postTemplate}`);
    writeFileSync(config.postTemplate, getDefaultPostTemplate(), 'utf-8');
  }

  return true;
}

function getDefaultIndexTemplate() {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Simple Photo Blog</title>
</head>

<body>
  <header>
    <h1>My Simple Photo Blog</h1>
  </header>
  <ul class="posts">
    <!-- content -->
  </ul>
</body>

</html>`;
}

function getDefaultPostTemplate() {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>
    <!-- title -->
  </title>
</head>

<body>
  <header>
    <h1>My Simple Photo Blog</h1>
  </header>

  <h2>
    <!-- title -->
  </h2>
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