import { Post } from './models/Post';
import { getItemContent } from './get-post-meta';

const contentPlaceholder = /<!-- content -->/;

export function renderIndex(template: string, posts: Post[]) {
  return (template || '')
    .replace(
      contentPlaceholder,
      posts.map(({ slug, attachments, title, pubDate, tags }) => `
  <li class="post">
    <a href="${slug}" class="post_picture">${getItemContent(attachments[0], slug)}</a>
    <a class="post_title" href="${slug}">${title}</a>
    <span class="post_pubDate">${pubDate}</span>
    <ul class="post_tags">${tags.map(tag => `<li>${tag}</li>`).join('')}</ul>
  </li>`).join('\n'));
}