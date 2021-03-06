"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderIndex = void 0;
const get_post_meta_1 = require("./get-post-meta");
const contentPlaceholder = /<!-- content -->/;
const titlePlaceholder = /<!-- blogTitle -->/g;
function renderIndex(template, blogTitle, posts) {
    return (template || '')
        .replace(titlePlaceholder, blogTitle)
        .replace(contentPlaceholder, posts.map(({ source, slug, attachments, title, pubDate, tags }) => `
  <li class="post">
    <a href="${slug}" class="post_hero">${get_post_meta_1.getItemContent(attachments[0], source, slug)}</a>
    <a class="post_title" href="${slug}">${title}</a>
    <span class="post_pubDate">${pubDate}</span>
    <ul class="post_tags">${tags.map(tag => `<li>${tag}</li>`).join('')}</ul>
  </li>`).join('\n'));
}
exports.renderIndex = renderIndex;
//# sourceMappingURL=render-index.js.map