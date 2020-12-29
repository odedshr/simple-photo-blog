import { Post } from './Post';

const contentPlaceholder = /<!-- content -->/;

export function renderIndex(template: string, posts: Post[]) {
  return template
    .replace(
      contentPlaceholder,
      posts.map(({ slug, images, title, pubDate, tags }) => `
  <li class="post">
    <a href="${slug}" class="post_picture">
      <img class="post_image"src="${slug}/${images[0]}" alt="${images[0].replace(/^\d+\s+/, '')}" />
    </a>
    <a class="post_title" href="${slug}">${title}</a>
    <span class="post_pubDate">${pubDate}</span>
    <ul class="post_tags">${tags.map(tag => `<li>${tag}</li>`).join('')}</ul>
  </li>`).join('\n'));
}