import { Post } from './models/Post';

const titlePlaceholder = /<!-- title -->/g;
const blogTitlePlaceholder = /<!-- blogTitle -->/g;
const contentPlaceholder = '<!-- content -->';
const pubDatePlaceholder = '<!-- pubDate -->';
const tagsPlaceHolder = '<!-- tags -->';

export function renderPost(template: string, blogTitle: string, post: Post, content: string) {
  const { title, pubDate, tags } = post;

  return template
    .replace(blogTitlePlaceholder, blogTitle)
    .replace(titlePlaceholder, title)
    .replace(contentPlaceholder, content || '')
    .replace(pubDatePlaceholder, pubDate)
    .replace(tagsPlaceHolder, tags.map(tag => `<li>${tag}</li>`).join(''));
}