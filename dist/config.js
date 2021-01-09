"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const defaultConfig = {
    source: 'src',
    target: 'www',
    indexTemplate: 'src/index-template.html',
    postTemplate: 'src/post-template.html',
    order: 'ascending',
    maxImageDimension: 0,
    //@ts-ignore
    executeExample: 'git add . && git commit - a - m "💬 blog update `date`" && git push'
};
function getConfig(cwd) {
    const configFile = path_1.join(cwd, 'blog-config.yaml');
    if (!fs_1.existsSync(configFile)) {
        console.error(' ⚠️  config.yaml missing, creating a default file');
        fs_1.mkdirSync(cwd, { recursive: true });
        fs_1.writeFileSync(configFile, toYaml(defaultConfig), 'utf-8');
    }
    let config = Object.assign(Object.assign({}, defaultConfig), fromYaml(fs_1.readFileSync(configFile, 'utf-8')));
    const indexTemplate = path_1.join(cwd, config.indexTemplate);
    const postTemplate = path_1.join(cwd, config.postTemplate);
    config = {
        modified: new Date(),
        cwd,
        source: path_1.join(cwd, config.source),
        target: path_1.join(cwd, config.target),
        indexTemplate,
        postTemplate,
        maxImageDimension: +config.maxImageDimension || 0,
        versionFile: config.versionFile ? path_1.join(cwd, config.versionFile) : undefined,
        order: config.order,
        execute: config.execute
    };
    return validateConfig(config) ? Object.assign(Object.assign({}, config), { modified: getLatestFileModify(indexTemplate, postTemplate, configFile) }) : false;
}
exports.getConfig = getConfig;
function getLatestFileModify(...files) {
    return new Date(Math.max(...files.map(file => fs_1.lstatSync(file).mtime.getTime())));
}
function toYaml(config) {
    return Object.keys(config).map((key) => `${key}: ${
    //@ts-ignore
    config[key]}`).join('\n');
}
function fromYaml(fileContent) {
    let config = {};
    fileContent.split('\n').map((line) => {
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
    return config;
}
function validateConfig(config) {
    if (!fs_1.existsSync(config.source)) {
        console.error(` 🛑 Source folder doesn't not exists: ${config.source}`);
        return false;
    }
    if (!fs_1.existsSync(config.target)) {
        console.error(` ⚠️  Creating target folder: ${config.target}`);
        fs_1.mkdirSync(config.target);
    }
    if (!fs_1.existsSync(config.indexTemplate)) {
        console.error(` ⚠️  Creating index template: ${config.indexTemplate}`);
        fs_1.writeFileSync(config.indexTemplate, getDefaultIndexTemplate(), 'utf-8');
    }
    if (!fs_1.existsSync(config.postTemplate)) {
        console.error(` ⚠️  Creating post template: ${config.postTemplate}`);
        fs_1.writeFileSync(config.postTemplate, getDefaultPostTemplate(), 'utf-8');
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
//# sourceMappingURL=config.js.map