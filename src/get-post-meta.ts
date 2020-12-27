import { statSync, readdirSync, readFileSync } from 'fs';
import { extname } from 'path';
//@ts-ignore as @types remarkable throws compilation errors regarding EOL highlight.js
import { Remarkable } from 'remarkable';
import { Post } from './Post';

type MD = {
  render(input: string): string;
};

const md: MD = new Remarkable();
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
      ? getImageWithCaption(item)
      : `<div class="post_text">${getTextContent(`${path}/${item}`)}</div>`)
    .join('\n')
}

function getImageWithCaption(file: string) {
  const [index, alt, caption] = file.substr(0, file.lastIndexOf('.'));
  const captionTag = caption ? `<figcaption class="post_image_caption">${caption}</figcaption>` : '';
  return `
  <figure class="post_picture">
    <img class="post_image" src="${file}" alt="${alt || index}"/>${captionTag}
  </figure>`;
}

function getTextContent(file: string) {
  const content = readFileSync(`${file}`, 'utf-8')
  switch (getFileType(file)) {
    case 'txt': return content.replace(/\n/g, '<br/>');
    case 'md': return md.render(content);
    default:
    case 'txt': return content;
  }
}

function getFileType(file: string) {
  return extname(file).substr(1).toLowerCase();
}

function isFileOfType(file: string, types: string[]) {
  return types.indexOf(getFileType(file)) !== -1;
}