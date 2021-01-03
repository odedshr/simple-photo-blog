import { readdirSync, copyFileSync, existsSync, lstatSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import * as Jimp from 'jimp';

import { getPostMeta, getPostContent } from './get-post-meta';
import { renderPost } from './render-post';
import { renderIndex } from './render-index';
import { execute } from './execute';
import { updateVersion } from './update-version';
import { Config } from './models/Config';
import { Post, PostElement } from './models/Post';

export async function compile(config: Config) {
  const postTemplate = readFileSync(config.postTemplate, 'utf-8');

  const posts: Post[] = await Promise.all(getPostList(config.source, config.order === 'ascending')
    .map(getPostMeta.bind(null, config.source))
    .filter(post => post.attachments.length)
    .map(addTargetFolder.bind(null, config.target))
    .map(
      async post => processPost(postTemplate, config.source, config.overwrite, config.maxImageDimension, post)
    )
  );

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

function addTargetFolder(targetPath: string, post: Post): Post {
  return {
    ...post,
    target: `${targetPath}/${post.slug}`
  };
}

async function processPost(postTemplate: string, sourcePath: string, overwrite: boolean, maxImageDimension: number, post: Post): Promise<Post> {
  const { slug, target, folder } = post;
  const isFolderExists = existsSync(target);

  // if post didn't exist, copy its content
  if (overwrite || !isFolderExists) {
    !isFolderExists && mkdirSync(target);
    const updateCount = await copyPostAttachments(post.attachments, `${sourcePath}/${folder}`, target, maxImageDimension);
  }

  // if post index didn't exist, create it
  if (overwrite || !existsSync(`${target}/index.html`)) {
    console.info(`\n 💾 Writing ${slug}`);

    const content = getPostContent(post);

    writeFileSync(
      `${target}/index.html`,
      renderPost(postTemplate, { ...post, content }),
      'utf-8'
    );
  }

  return post;
}

async function copyPostAttachments(attachments: PostElement[], source: string, target: string, maxImageDimension: number) {
  const updates = await Promise.all(attachments
    .map(async attachment => {
      if (attachment.link.match(/\.video\.txt$/)) {
        return 0;
      }

      if (attachment.type === 'image' && !attachment.link.match(/\.svg$/) && maxImageDimension) {
        const image = await Jimp.read(join(source, attachment.link));
        await image.scaleToFit(maxImageDimension, maxImageDimension).writeAsync(join(target, attachment.link));
      } else {
        copyFileSync(join(source, attachment.link), join(target, attachment.link));
      }
      return 1;
    })
  );

  return updates.reduce((sum: number, i) => (sum + i), 0);
}