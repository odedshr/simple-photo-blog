import { copyFileSync, existsSync, lstatSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as Jimp from 'jimp';

import { getPostContent } from './get-post-meta';
import { renderPost } from './render-post';
import { Post, PostElement } from './models/Post';

//@ts-ignore
const JIMP: JimpConstructors = (!Jimp.read && Jimp.default) ? Jimp.default : Jimp;

export async function processPost(
  postTemplate: string,
  blogTitle: string,
  targetPath: string,
  maxImageDimension: number,
  expirationDate: Date,
  post: Post
): Promise<Post> {
  const { slug, source } = post;

  try {
    const target = `${targetPath}/${slug}`;
    const postFile = `${target}/index.html`;
    const folderRequiresUpdate = isFolderRequireUpdate(source, target, expirationDate);
    const postModifyTime = getFileModifyDate(postFile);
    // if post index didn't exist, create it

    if (!folderRequiresUpdate) {
      console.info(`\n ✓ Skipping ${slug}`);
      return post;
    }

    console.info(`\n 💾 Writing ${slug}`);

    !existsSync(target) && mkdirSync(target);
    await copyPostAttachments(post.attachments, source, target, maxImageDimension);

    if (!postModifyTime || postModifyTime > expirationDate) {
      const content = getPostContent(post);

      writeFileSync(
        `${target}/index.html`,
        renderPost(postTemplate, blogTitle, post, content),
        'utf-8'
      );
    }
  }
  catch (err) {
    console.error(` 🛑 Error processing post:\n${err}\n${JSON.stringify(post, null, 2)}`);
  }


  return post;
}

function isFolderRequireUpdate(source: string, target: string, expirationDate: Date) {
  const sourceModifyTime = getFileModifyDate(source);
  const targetModifyTime = getFileModifyDate(target);

  return !targetModifyTime ||
    targetModifyTime.getTime() < expirationDate.getTime() ||
    !sourceModifyTime ||
    sourceModifyTime.getTime() > targetModifyTime.getTime();
}

function getFileModifyDate(file: string) {
  if (existsSync(file)) {
    return lstatSync(file).mtime;
  }

  return false;
}

async function copyPostAttachments(attachments: PostElement[], source: string, target: string, maxImageDimension: number) {
  const updates = await Promise.all(attachments
    .map(async attachment => {
      if (attachment.link.indexOf('//') > -1) {
        return 0;
      }

      const imageSource = join(source, attachment.link);
      const imageTarget = join(target, attachment.link);

      if (attachment.type === 'image' && !attachment.link.match(/\.svg$/) && maxImageDimension) {
        const image = await JIMP.read(imageSource);
        await image.scaleToFit(maxImageDimension, maxImageDimension).writeAsync(imageTarget);
      } else {
        copyFileSync(imageSource, imageTarget);
      }
      return 1;
    })
  );

  return updates.reduce((sum: number, i) => (sum + i), 0);
}