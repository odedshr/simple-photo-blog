import { statSync, readdirSync, readFileSync } from 'fs';
import { extname } from 'path';
//@ts-ignore as @types remarkable throws compilation errors regarding EOL highlight.js
import { Remarkable } from 'remarkable';
import { Post } from './models/Post';

type MD = {
  render(input: string): string;
};

const md: MD = new Remarkable();
const imageFileTypes = ['jpg', 'png', 'gif'];
const blogFileTypes = [...imageFileTypes, 'txt', 'md', 'html'];
const pubDatePattern = /^\d{4}[\.\/-]\d{1,2}[\.\/-]\d{1,2}/;
const tagsPattern = /#\S*/g;

export function getPostMeta(parent: string, folder: string): Post {
  const source = `${parent}/${folder}`;
  const items = getPostItems(source);

  return {
    folder,
    target: '',
    title: folder.replace(tagsPattern, '').replace(pubDatePattern, '').trim(),
    slug: folder.replace(tagsPattern, '').trim().replace(/\s/g, '-').toLowerCase(),
    pubDate: getDateFromName(folder) || getDateFromFileState(source),
    tags: folder.match(tagsPattern) || [],
    items,
    images: items
      .filter(item => isFileOfType(item, imageFileTypes))
  };
}

function getPostItems(source: string): string[] {
  return readdirSync(source)
    .filter(item => isFileOfType(item, blogFileTypes))
    .sort()
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getDateFromName(name: string) {
  const match = name.match(pubDatePattern);
  return match ? formatDate(new Date(match[0])) : null;
}

function getDateFromFileState(fullPathFilename: string) {
  return formatDate(statSync(fullPathFilename).ctime);
}

export function getPostContent(post: Post, path: string): string {
  const captionFiles = getCaptionsFiles(post.items, post.images);
  const captionContent = getPotentialCaptions(path, captionFiles);

  return post.items
    .filter(item => !captionFiles.includes(item))
    .map(item => isFileOfType(item, imageFileTypes)
      ? getImageWithCaption(item, captionContent[item])
      : `<div class="post_text">${getTextContent(`${path}/${item}`)}</div>`)
    .join('\n')
}

function getCaptionsFiles(items: string[], images: string[]): string[] {
  return items
    .filter(item =>
      !images.includes(item) &&
      images.includes(item.substr(0, item.lastIndexOf('.')))
    );
}

function getPotentialCaptions(path: string, items: string[]) {
  const captions: { [key: string]: string } = {};

  items.forEach(item => {
    captions[item.substr(0, item.lastIndexOf('.'))] = getTextContent(`${path}/${item}`);
  });

  return captions
}

function getImageWithCaption(file: string, caption?: string) {
  const captionTag = caption ? `<figcaption class="post_image_caption">${caption}</figcaption>` : '';
  const altText = file.substr(0, file.lastIndexOf('.')).replace(/^\d+\s+/, '');

  return `
  <figure class="post_picture">
    <img class="post_image" src="${file}" alt="${altText}"/>${captionTag}
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