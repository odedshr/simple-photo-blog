import * as assert from 'assert';
import { mkdirSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Post, PostElement } from '../models/Post';
import { processPost } from '../process-post';
import { muteConsole, unmuteConsole, deleteFolderRecursive } from './utils';

describe('Process Post', () => {
  const cwd = join(__dirname, 'compile-test');
  const targetPath = join(cwd, 'target');

  afterEach(() => {
    deleteFolderRecursive(cwd);
  });

  it('should return the same post as received', async () => {
    mkdirSync(targetPath, { recursive: true });

    const originConsole = muteConsole();
    const post = getPost();
    const originalPostContent = JSON.stringify(post);
    const newPost = await processPost('template', 'blogTitle', targetPath, 0, new Date(), post);
    unmuteConsole(originConsole);
    assert.strictEqual(originalPostContent, JSON.stringify(newPost))
  });

  it('Throw an error if target not exists', async () => {
    let errorMessage = '';
    const post = getPost();
    const originConsole = muteConsole();
    console.error = (...data: any[]) => { errorMessage = data[0]; };

    await processPost('template', 'blogTitle', targetPath, 0, new Date(), post);
    unmuteConsole(originConsole);

    assert.ok(errorMessage.indexOf(`no such file or directory, mkdir`) > -1);
  });

  it('should return the same post as received', async () => {
    mkdirSync(targetPath, { recursive: true });

    const originConsole = muteConsole();
    const post = getPost();
    const originalPostContent = JSON.stringify(post);
    const newPost = await processPost('template', 'blogTitle', targetPath, 0, new Date(), post);
    unmuteConsole(originConsole);
    assert.strictEqual(originalPostContent, JSON.stringify(newPost))
  });

  it(`shouldn't try to copy video link`, async () => {
    mkdirSync(targetPath, { recursive: true });

    const post = getPost();
    const postElement: PostElement = { type: 'video', link: 'http://link' };
    post.items.push(postElement);
    post.attachments.push(postElement);

    const originConsole = muteConsole();
    await processPost('<!-- content -->', 'blogTitle', targetPath, 0, new Date(), post);
    unmuteConsole(originConsole);

    assert.strictEqual(readFileSync(join(cwd, 'target/slug/index.html'), 'utf-8'), `
  <video class="post_video" controls>
    <source src="http://link" type="video/">
    😢 Your browser does not support the video tag.
  </video>`);
  });
});

function getPost(): Post {
  return {
    modified: new Date(),
    slug: 'slug',
    source: 'source',
    title: 'title',
    pubDate: 'pubDate',
    tags: [],
    items: [],
    attachments: []
  };
}