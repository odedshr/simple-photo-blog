import * as assert from 'assert';
import { AnyARecord } from 'dns';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { Post } from '../models/Post';
import { processPost } from '../process-post';
import { muteConsole, unmuteConsole, deleteFolderRecursive } from './utils';

describe('Process Post', () => {
  const cwd = join(__dirname, 'compile-test');

  afterEach(() => {
    deleteFolderRecursive(cwd);
  });

  it('should return the same post as received', async () => {
    const originConsole = muteConsole();
    const post = getPost();
    const originalPostContent = JSON.stringify(post);
    const newPost = await processPost('template', 'source', 'target', 0, new Date(), post);
    unmuteConsole(originConsole);
    assert.strictEqual(originalPostContent, JSON.stringify(newPost))
  });

  it('Throw an error if target not exists', async () => {
    const originConsole = muteConsole();
    let errorMessage = '';
    console.error = (...data: any[]) => { errorMessage = data[0]; };
    const post = getPost();
    const originalPostContent = JSON.stringify(post);
    const newPost = await processPost('template', 'source', 'target', 0, new Date(), post);
    unmuteConsole(originConsole);
    assert.ok(errorMessage.indexOf(`no such file or directory, mkdir 'target/slug'`) > -1);
  });

  it('should return the same post as received', async () => {
    mkdirSync(join(cwd, 'target'), { recursive: true });

    const originConsole = muteConsole();
    const post = getPost();
    const originalPostContent = JSON.stringify(post);
    const newPost = await processPost('template', 'source', 'target', 0, new Date(), post);
    unmuteConsole(originConsole);
    assert.strictEqual(originalPostContent, JSON.stringify(newPost))
  });
});

function getPost(): Post {
  return {
    modified: new Date(),
    slug: 'slug',
    folder: 'folder',
    title: 'title',
    pubDate: 'pubDate',
    tags: [],
    items: [],
    attachments: []
  };
}