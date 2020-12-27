import { readdirSync, copyFileSync, existsSync, lstatSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

import { getConfig } from './config';
import { getPostMeta, getPostContent } from './get-post-meta';
import { renderPost } from './render-post';
import { renderIndex } from './render-index';
import { execute } from './execute';
import { updateVersion } from './update-version';
import { Post } from './Post';

init();

async function init() {

  console.info('==============================================================');

  const config = getConfig();

  if (!config) {
    return false;
  }

  const postTemplate = readFileSync(config.postTemplate, 'utf-8');

  const posts = getPostList(config.source, config.order === 'ascending')
    .map(getPostMeta.bind(null, config.source))
    .map(addTargetFolder.bind(null, config.target))
    .map(processPost.bind(null, postTemplate, config.source, config.overwrite));

  writeFileSync(
    `${config.target}/index.html`,
    renderIndex(readFileSync(config.indexTemplate, 'utf-8'), posts),
    'utf-8'
  );

  console.info(`\n ✅ Indexing complete for ${posts.length} posts`);

  if (config.versionFile) {
    updateVersion(config.versionFile)
  }

  if (config.execute && config.execute.length) {
    await execute(config.cwd, config.execute).catch(err => err);
  }

  console.info('\n==============================================================');
}

// ================

function getPostList(source: string, sortAscending: boolean) {
  const files = readdirSync(source)
    .filter((item: string) => lstatSync(`${source}/${item}`).isDirectory())
    .sort();

  if (!sortAscending) {
    return files.reverse();
  }

  return files;
}

function addTargetFolder(targetPath: string, post: Post): Post {
  return {
    ...post,
    target: `${targetPath}/${post.slug}`
  };
}

function processPost(postTemplate: string, sourcePath: string, overwrite: boolean, post: Post): Post {
  const { slug, target, folder } = post;
  const isFolderExists = existsSync(target);

  // if post didn't exist, copy its content
  if (overwrite || !isFolderExists) {
    !isFolderExists && mkdirSync(target);
    copyPostImages(post.images, `${sourcePath}/${folder}`, target);
  }

  // if post index didn't exist, create it
  if (overwrite || !existsSync(`${target}/index.html`)) {
    console.info(`\n 💾 Writing ${slug}`);

    const content = getPostContent(post, join(sourcePath, folder));

    writeFileSync(
      `${target}/index.html`,
      renderPost(postTemplate, { ...post, content }),
      'utf-8'
    );
  }

  return post;
}

function copyPostImages(images: string[], source: string, target: string) {
  images
    .forEach(image => copyFileSync(join(source, image), join(target, image)));
}