import { readdirSync, lstatSync, writeFileSync, readFileSync } from 'fs';

import { getPostMeta, distinctSlugs } from './get-post-meta';
import { processPost } from './process-post';
import { renderIndex } from './render-index';
import { execute } from './execute';
import { updateVersion } from './update-version';
import { Config } from './models/Config';
import { Post } from './models/Post';

export async function compile(config: Config) {
  const postTemplate = readFileSync(config.postTemplate, 'utf-8');
  const templateModified = lstatSync(config.postTemplate).mtime
  const lastModify = new Date(Math.max(templateModified.getTime(), config.modified.getTime()));
  const { blogTitle, source, target, maxImageDimension } = config;

  const posts: Post[] = distinctSlugs(
    getPostList(config.source, config.order === 'ascending')
      .map(getPostMeta.bind(null, config.source))
      .filter(post => post.attachments.length)
  );

  await Promise.all(
    posts.map(
      async post => processPost(postTemplate, blogTitle, target, maxImageDimension, lastModify, post)
    )
  );

  writeFileSync(
    `${config.target}/index.html`,
    renderIndex(readFileSync(config.indexTemplate, 'utf-8'), config.blogTitle, posts),
    'utf-8'
  );

  console.info(`\n ✅ Indexing complete for ${posts.length} posts`);

  if (config.versionFile) {
    updateVersion(config.versionFile)
  }

  if (config.execute && config.execute.length) {
    await execute(config.cwd, config.execute).catch(err => err);
  }

  return posts;
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
