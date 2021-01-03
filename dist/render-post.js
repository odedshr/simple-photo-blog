"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPost = void 0;
const titlePlaceholder = /<!-- title -->/g;
const contentPlaceholder = '<!-- content -->';
const pubDatePlaceholder = '<!-- pubDate -->';
const tagsPlaceHolder = '<!-- tags -->';
function renderPost(template, post) {
    const { title, content, pubDate, tags } = post;
    return template
        .replace(titlePlaceholder, title)
        .replace(contentPlaceholder, content || '')
        .replace(pubDatePlaceholder, pubDate)
        .replace(tagsPlaceHolder, tags.map(tag => `<li>${tag}</li>`).join(''));
}
exports.renderPost = renderPost;
//# sourceMappingURL=render-post.js.map