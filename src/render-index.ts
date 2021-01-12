import { Post } from './models/Post';
import { getItemContent } from './get-post-meta';

const contentPlaceholder = /<!-- content -->/;
const titlePlaceholder = /<!-- blogTitle -->/g;

export function renderIndex(template: string, blogTitle: string, posts: Post[]) {
  return (template || '')
    .replace(titlePlaceholder, blogTitle)
    .replace(
      contentPlaceholder,
      posts.map(({ slug, attachments, title, pubDate, tags }) => `
  <li class="post">
    <a href="${slug}" class="post_hero">${getItemContent(attachments[0], slug)}</a>
    <a class="post_title" href="${slug}">${title}</a>
    <span class="post_pubDate">${pubDate}</span>
    <ul class="post_tags">${tags.map(tag => `<li>${tag}</li>`).join('')}</ul>
  </li>`).join('\n'));
}