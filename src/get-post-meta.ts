import { statSync, readdirSync, readFileSync } from 'fs';
import { extname } from 'path';
import { Post } from './Post';

const imageFileTypes = ['jpg', 'png', 'gif'];
const blogFileTypes = [...imageFileTypes, 'txt', 'md', 'html'];
const pubDatePattern = /^\d{4}\-\d{2}-\d{2}/;
const tagsPattern = /#\S*/g;

export function getPostMeta(parent: string, folder: string): Post {
  const source = `${parent}/${folder}`;
  const items = readdirSync(source)
    .filter(item => isFileOfType(item, blogFileTypes))
    .sort();

  return {
    folder,
    target: '',
    title: folder.replace(tagsPattern, '').replace(pubDatePattern, '').trim(),
    slug: folder.replace(tagsPattern, '').trim().replace(/\s/g, '-').toLowerCase(),
    pubDate: getDateFromName(folder) || getDateFormFileStat(source),
    tags: folder.match(tagsPattern) || [],
    items,
    images: items
      .filter(item => isFileOfType(item, imageFileTypes))
  };
}


function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getDateFromName(name: string) {
  const match = name.match(pubDatePattern);
  return match ? formatDate(new Date(match[0])) : null;
}

function getDateFormFileStat(fullPathFilename: string) {
  return formatDate(statSync(fullPathFilename).ctime);
}

export function getPostContent(post: Post, path: string): string {
  const { slug } = post;

  return post.items
    .map(item => isFileOfType(item, imageFileTypes)
      ? `<picture class="post_picture"><img class="post_image" src='${item}' /></picture>`
      : `<div class="post_text">${readFileSync(`${path}/${item}`, 'utf-8')}</div>`)
    .join('\n')
}

function isFileOfType(file: string, types: string[]) {
  return types.indexOf(extname(file).substr(1).toLowerCase()) !== -1
}