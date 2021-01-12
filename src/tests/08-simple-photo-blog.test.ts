import * as assert from 'assert';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, lstatSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { getConfig } from '../config';
import { compile } from '../simple-photo-blog';
import { muteConsole, unmuteConsole, deleteFolderRecursive } from './utils';


describe('Simple Photo Blog', () => {
  const cwd = join(__dirname, 'compile-test');

  afterEach(() => {
    deleteFolderRecursive(cwd);
  });

  it(`shouldn't consider folder with no binaries as posts`, async () => {
    mkdirSync(join(cwd, 'src', 'post-1'), { recursive: true });
    const origConsole = muteConsole();
    const config = getConfig(join(__dirname, 'compile-test'));

    if (!config) {
      assert.fail('failed to load config');
    }


    const posts = await compile(config);
    unmuteConsole(origConsole);

    assert.strictEqual(posts.length, 0);
  });

  it(`should update versionFile`, async () => {
    const versionFile = join(cwd, 'version.json');
    const origConsole = muteConsole();

    makePost(cwd, 'src', '2020-01-01 post-1');
    writeFileSync(join(cwd, 'blog-config.yaml'), 'versionFile: version.json', 'utf-8');
    writeFileSync(versionFile, '{"version": "1.0.0"}', 'utf-8');
    const config = getConfig(join(__dirname, 'compile-test'));

    if (!config) {
      assert.fail('failed to load config');
    }


    const posts = await compile(config);
    unmuteConsole(origConsole);

    assert.strictEqual(JSON.parse(readFileSync(versionFile, 'utf-8')).version, '1.0.1');
  });

  it(`should execute shell command`, async () => {
    const origConsole = muteConsole();

    makePost(cwd, 'src', '2020-01-01 post-1');
    writeFileSync(join(cwd, 'blog-config.yaml'), 'execute: pwd', 'utf-8');
    const config = getConfig(join(__dirname, 'compile-test'));

    if (!config) {
      assert.fail('failed to load config');
    }

    let flag = false;
    console.info = (...data: any[]) => {
      if (data.join() === '\n 🕹  pwd\n') {
        flag = true;
      }
    }
    const posts = await compile(config);
    unmuteConsole(origConsole);

    assert.ok(flag);
  });

  it(`should sort descending`, async () => {
    const origConsole = muteConsole();

    makePost(cwd, 'src', '2020-01-01 post-1');
    makePost(cwd, 'src', '2021-01-01 post-2');
    writeFileSync(join(cwd, 'blog-config.yaml'), 'order: descending', 'utf-8');
    const config = getConfig(join(__dirname, 'compile-test'));

    if (!config) {
      assert.fail('failed to load config');
    }

    const posts = await compile(config);
    unmuteConsole(origConsole);

    assert.strictEqual(posts[0].title, 'post-2');
  });

  it(`should skip existing files`, async () => {
    const origConsole = muteConsole();

    makePost(cwd, 'src', '2020-01-01 post-1');
    makePost(cwd, 'www', '2020-01-01 post-1');
    const config = getConfig(join(__dirname, 'compile-test'));

    if (!config) {
      assert.fail('failed to load config');
    }

    const posts = await compile(config);
    unmuteConsole(origConsole);

    assert.strictEqual(posts[0].title, 'post-1');
  });


  it(`should overwrite existing files`, async () => {
    const origConsole = muteConsole();

    makePost(cwd, 'src', '2020-01-01 post-1');
    makePost(cwd, 'www', '2020-01-01 post-1');
    writeFileSync(join(cwd, 'blog-config.yaml'), 'overwrite: true', 'utf-8');
    const config = getConfig(join(__dirname, 'compile-test'));

    if (!config) {
      assert.fail('failed to load config');
    }

    const posts = await compile(config);
    unmuteConsole(origConsole);

    assert.strictEqual(posts[0].title, 'post-1');
  });

  it(`shouldn't try to copy video links`, async function () {
    const origConsole = muteConsole();

    makePost(cwd, 'src', '2020-01-01 post-1');
    writeFileSync(join(cwd, 'src', '2020-01-01 post-1', 'link.video.txt'), 'https://videowebsite.com', 'utf-8');

    const config = getConfig(join(__dirname, 'compile-test'));

    if (!config) {
      assert.fail('failed to load config');
    }

    await compile(config);
    unmuteConsole(origConsole);
    assert.ok(!existsSync(join(cwd, 'www', '2020-01-01-post-1', 'link.video.txt')));
  });

  it(`should resize images`, async function () {
    this.timeout(10000);

    makePost(cwd, 'src', '2020-01-01 post-1');
    copyFileSync(join(__dirname, '../../src/tests/test-image.jpg'), join(cwd, 'src', '2020-01-01 post-1', 'image.jpg'));
    const config = getConfig(join(__dirname, 'compile-test'));

    if (!config) {
      assert.fail('failed to load config');
    }

    config.maxImageDimension = 300;
    const origConsole = muteConsole();
    await compile(config);
    unmuteConsole(origConsole);

    assert.ok(existsSync(join(cwd, 'www', '2020-01-01-post-1', 'image.jpg')));
    assert.strictEqual(lstatSync(join(cwd, 'www', '2020-01-01-post-1', 'image.jpg')).size, 65101);
  });

  it(`should update only newer content`, async function () {
    this.timeout(3000);

    makePost(cwd, 'src', '2020-01-01 static');
    makePost(cwd, 'src', '2020-01-01 updating');
    const origConsole = muteConsole();
    const config = getConfig(join(__dirname, 'compile-test'));

    if (!config) {
      assert.fail('failed to load config');
    }

    await compile(config);
    const staticDate = lstatSync(join(cwd, 'www', '2020-01-01-static')).mtime;
    const updatingDate = lstatSync(join(cwd, 'www', '2020-01-01-updating')).mtime;

    await wait(1000);
    writeFileSync(join(cwd, 'src', '2020-01-01 updating', 'image1.jpg'), 'y', 'utf-8');
    assert.notStrictEqual(updatingDate.getTime(), lstatSync(join(cwd, 'src', '2020-01-01 updating')).mtime.getTime());

    await compile(config);
    unmuteConsole(origConsole);

    assert.strictEqual(staticDate.getTime(), lstatSync(join(cwd, 'www', '2020-01-01-static')).mtime.getTime());
    assert.ok(updatingDate.getTime() < lstatSync(join(cwd, 'www', '2020-01-01-updating')).mtime.getTime());
  });

  it(`should update content if index template is newer`, async function () {
    testFileUpdate(cwd, 'src/index-template.html', 'index.html');
  });

  it(`should update content if post template is newer`, async function () {
    testFileUpdate(cwd, 'src/post-template.html', '2020-01-01-updating');
  });
});


async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function makePost(cwd: string, target: string, postName: string) {
  mkdirSync(join(cwd, target, postName), { recursive: true });
  writeFileSync(join(cwd, target, postName, 'image.jpg'), 'x', 'utf-8');
}

async function testFileUpdate(cwd: string, fileToUpdate: string, fileToTest: string) {
  makePost(cwd, 'src', '2020-01-01 updating');

  const origConsole = muteConsole();
  let config = getConfig(join(__dirname, 'compile-test'));

  if (!config) {
    assert.fail('failed to load config');
  }

  await compile(config);
  const updatingDate = lstatSync(join(cwd, 'www', fileToTest)).mtime;

  await wait(1000);

  writeFileSync(join(cwd, fileToUpdate), 'xxx', 'utf-8');
  config = getConfig(join(__dirname, 'compile-test'));

  if (!config) {
    assert.fail('failed to load config');
  }
  await compile(config);
  unmuteConsole(origConsole);

  assert.ok(updatingDate.getTime() < lstatSync(join(cwd, 'www', fileToTest)).mtime.getTime());
}