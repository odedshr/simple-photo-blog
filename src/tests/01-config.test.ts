import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import * as assert from 'assert';
import { deleteFolderRecursive, deleteIfExists, muteConsole, unmuteConsole } from './utils';
import { getConfig } from '../config';

const simpleConfig = {
  source: 'src',
  target: 'www',
  indexTemplate: 'src/index-template.html',
  postTemplate: 'src/post-template.html'
};

const fullPathConfig = {
  src: join(__dirname, simpleConfig.source),
  target: join(__dirname, simpleConfig.target),
  indexTemplate: join(__dirname, simpleConfig.indexTemplate),
  postTemplate: join(__dirname, simpleConfig.postTemplate)
};


const configFile = join(__dirname, 'blog-config.yaml');

afterEach(() => {
  deleteFolderRecursive(fullPathConfig.src);
  deleteFolderRecursive(fullPathConfig.target);
  deleteIfExists(configFile);
  deleteIfExists(fullPathConfig.indexTemplate);
  deleteIfExists(fullPathConfig.postTemplate);
});

describe('Config', () => {
  it('should create config.yaml if not exists', () => {
    assert.ok(!existsSync(configFile));

    const origConsole = muteConsole();
    const config = getConfig(__dirname);
    unmuteConsole(origConsole);

    assert.ok(existsSync(configFile));
    assert.strictEqual(readFileSync(configFile, 'utf-8'), `blogTitle: My Photo Blog
source: src
target: www
indexTemplate: src/index-template.html
postTemplate: src/post-template.html
order: ascending
maxImageDimension: 0
executeExample: git add . && git commit - a - m "💬 blog update \`date\`" && git push`);
  });

  it('should return false if source folder not exists', () => {
    const origConsole = muteConsole();
    assert.ok(!getConfig(__dirname));
    unmuteConsole(origConsole);
  });

  it('should read config file and return it', () => {
    mkdirSync(fullPathConfig.src);
    writeFileSync(configFile, `blogTitle: blog-title
source: ${simpleConfig.source}
target: www
indexTemplate: src/index-template.html
this line is bad because it has no colons
postTemplate: src/post-template.html
      `, 'utf-8');

    const origConsole = muteConsole();
    const config = getConfig(__dirname);
    unmuteConsole(origConsole);

    if (!config) {
      assert.fail('failed to load config');
    }
    assert.strictEqual(config.blogTitle, 'blog-title')
    assert.strictEqual(config.source, fullPathConfig.src);
  });

  it('should create missing required files', () => {
    !existsSync(fullPathConfig.src) && mkdirSync(fullPathConfig.src);
    assert.ok(!existsSync(fullPathConfig.target));
    assert.ok(!existsSync(fullPathConfig.indexTemplate));
    assert.ok(!existsSync(fullPathConfig.postTemplate));
    writeFileSync(configFile, `source: ${simpleConfig.source}
target: www
indexTemplate: src/index-template.html
postTemplate: src/post-template.html`, 'utf-8');

    const origConsole = muteConsole();
    const config = getConfig(__dirname);
    unmuteConsole(origConsole);

    if (!config) {
      assert.fail('failed to load config');
    }
    assert.ok(existsSync(fullPathConfig.src));
    assert.ok(existsSync(fullPathConfig.target));
    assert.ok(existsSync(fullPathConfig.indexTemplate));
    assert.ok(existsSync(fullPathConfig.postTemplate));
  });

  it('should add missing attributes to partial configs', () => {
    !existsSync(fullPathConfig.src) && mkdirSync(fullPathConfig.src);
    writeFileSync(configFile, `source: ${simpleConfig.source}
    target: www
    indexTemplate: src/index-template.html
    postTemplate: src/post-template.html`, 'utf-8');

    const origConsole = muteConsole();
    const config = getConfig(__dirname);
    unmuteConsole(origConsole);

    assert.ok(config && config.order === 'ascending');
  });

  it('should add modified Date', () => {
    !existsSync(fullPathConfig.src) && mkdirSync(fullPathConfig.src);
    writeFileSync(configFile, `overwrite: true`, 'utf-8');

    const origConsole = muteConsole();
    const config = getConfig(__dirname);
    unmuteConsole(origConsole);

    assert.ok(config);
    assert.ok((new Date()).getTime() - config.modified.getTime() < 200);
  });


  it('should get and display versionFile', () => {
    !existsSync(fullPathConfig.src) && mkdirSync(fullPathConfig.src);
    writeFileSync(configFile, `versionFile: test.json`, 'utf-8');

    const origConsole = muteConsole();
    const config = getConfig(__dirname);
    unmuteConsole(origConsole);

    assert.ok(config);
    assert.strictEqual(config.versionFile, join(__dirname, 'test.json'));
  });
});