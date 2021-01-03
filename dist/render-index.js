"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderIndex = void 0;
const get_post_meta_1 = require("./get-post-meta");
const contentPlaceholder = /<!-- content -->/;
function renderIndex(template, posts) {
    return (template || '')
        .replace(contentPlaceholder, posts.map(({ slug, attachments, title, pubDate, tags }) => `
  <li class="post">
    <a href="${slug}" class="post_picture">${get_post_meta_1.getItemContent(attachments[0], slug)}</a>
    <a class="post_title" href="${slug}">${title}</a>
    <span class="post_pubDate">${pubDate}</span>
    <ul class="post_tags">${tags.map(tag => `<li>${tag}</li>`).join('')}</ul>
  </li>`).join('\n'));
}
exports.renderIndex = renderIndex;
//# sourceMappingURL=render-index.js.map