import { Post } from './models/Post';

const titlePlaceholder = /<!-- title -->/g;
const contentPlaceholder = '<!-- content -->';
const pubDatePlaceholder = '<!-- pubDate -->';
const tagsPlaceHolder = '<!-- tags -->';

export function renderPost(template: string, post: Post) {
  const { title, content, pubDate, tags } = post;

  return template
    .replace(titlePlaceholder, title)
    .replace(contentPlaceholder, content || '')
    .replace(pubDatePlaceholder, pubDate)
    .replace(tagsPlaceHolder, tags.map(tag => `<li>${tag}</li>`).join(''));
}