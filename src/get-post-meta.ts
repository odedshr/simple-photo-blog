import { lstatSync, readdirSync, readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';
//@ts-ignore as @types remarkable throws compilation errors regarding EOL highlight.js
import { Remarkable } from 'remarkable';
import { Post, PostElement } from './models/Post';

type MD = {
  render(input: string): string;
};

const md: MD = new Remarkable();
export const videoFileTypes = ['video.txt', 'mov', 'avi', 'mp4', 'mkv', 'mpg'];
export const imageFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
const textFileTypes = ['txt', 'md', 'html'];
const blogFileTypes = [...imageFileTypes, ...videoFileTypes, ...textFileTypes];
const pubDatePattern = /^\d{4}[\.\/-]\d{1,2}[\.\/-]\d{1,2}/;
const tagsPattern = /#\S*/g;

export function getPostMeta(parent: string, folder: string): Post {
  const source = `${parent}/${folder}`;
  const items = getPostItems(source);
  const attachments = items
    .filter(item => item.type === 'image' || item.type === 'video');
  const captionFiles = filterCaptionElements(items, attachments);
  const captionContent = getCaptionMap(captionFiles);
  const itemsWithoutCaptions = items
    .filter(item => !captionFiles.includes(item))
    .map(item => ({ ...item, caption: captionContent[item.link] }));
  const attachmentsWithCaptions = attachments.map(item => ({ ...item, caption: captionContent[item.link] }));
  const modified = lstatSync(source).mtime

  return {
    folder,
    modified,
    title: folder.replace(tagsPattern, '').replace(pubDatePattern, '').trim(),
    slug: getSafeSlug(folder),
    pubDate: getDateFromName(folder) || formatDate(modified),
    tags: folder.match(tagsPattern) || [],
    items: itemsWithoutCaptions,
    attachments: attachmentsWithCaptions
  };
}

function getSafeSlug(folder: string) {
  const suggested = [folder
    .replace(tagsPattern, '')
    .replace(/"/g, '”')
    .trim()
    .replace(/[\s|-]+/g, '-')
    .toLowerCase()];
  let attempts = 0;

  return suggested.join('-');
}

function filterCaptionElements(items: PostElement[], attachments: PostElement[]): PostElement[] {
  const images = attachments.filter(item => item.type === 'image').map(item => item.link);

  return items
    .filter(item =>
      !images.includes(item.link) &&
      images.includes(item.link.substr(0, item.link.lastIndexOf('.')))
    );
}

function getCaptionMap(items: PostElement[]) {
  const captions: { [key: string]: string } = {};

  items.forEach(item => {
    captions[item.link.substr(0, item.link.lastIndexOf('.'))] = item.source ? getTextContent(item.source) : '';
  });

  return captions
}

function getPostItems(source: string): PostElement[] {
  return readdirSync(source)
    .filter(item => isFileOfType(item, blogFileTypes))
    .sort()
    .map(toPostElements.bind(null, source));
}

function toPostElements(source: string, link: string): PostElement {
  if (isFileOfType(link, imageFileTypes)) {
    return {
      link,
      type: 'image',
      alt: link.substr(0, link.lastIndexOf('.')).replace(/^\d+\s+/, '')
    };
  } else if (isFileOfType(link, videoFileTypes)) {
    return {
      link,
      type: 'video',
    };
  }
  else if (link.match(/\.video\.txt$/)) {
    return {
      link: readFileSync(join(source, link), 'utf-8'),
      type: 'video',
    };
  }

  return {
    link,
    type: 'text',
    source: join(source, link)
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getDateFromName(name: string) {
  const match = name.match(pubDatePattern);
  return match ? formatDate(new Date(match[0])) : null;
}

export function getPostContent(post: Post): string {
  return post.items
    .map(item => getItemContent(item))
    .join('\n')
}

export function getItemContent(item: PostElement, slug?: string) {
  if (item.type === 'image') {
    return getImageTag(item, slug);
  } else if (item.type === 'video') {
    return getVideoTag(item, slug);
  }

  return `<div class="post_text">${getTextContent(join(item.source || ''))}</div>`;
}

function getImageTag(element: PostElement, slug?: string) {
  const captionTag = element.caption ? `<figcaption class="post_image_caption">${element.caption}</figcaption>` : '';
  const link = slug ? `${slug}/${element.link}` : element.link
  return `
  <figure class="post_picture">
    <img class="post_image" src="${link}" alt="${element.alt}"/>${captionTag}
  </figure>`;
}

export function getVideoTag(element: PostElement, slug?: string) {
  const link = (slug && element.link.indexOf('//') === -1) ? `${slug}/${element.link}` : element.link
  return `
  <video class="post_video" controls>
    <source src="${link}" type="video/mp4">
    😢 Your browser does not support the video tag.
  </video>`;
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
  if (file.toLowerCase().match(/\.video\.txt$/)) {
    return 'video.txt';
  }

  return extname(file).substr(1).toLowerCase();
}

export function isFileOfType(file: string, types: string[]) {
  return types.indexOf(getFileType(file)) !== -1;
}