"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const fs_1 = require("fs");
const get_post_meta_1 = require("./get-post-meta");
const process_post_1 = require("./process-post");
const render_index_1 = require("./render-index");
const execute_1 = require("./execute");
const update_version_1 = require("./update-version");
function compile(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const postTemplate = fs_1.readFileSync(config.postTemplate, 'utf-8');
        const templateModified = fs_1.lstatSync(config.postTemplate).mtime;
        const lastModify = new Date(Math.max(templateModified.getTime(), config.modified.getTime()));
        const { blogTitle, source, target, maxImageDimension } = config;
        const posts = get_post_meta_1.distinctSlugs(getPostList(config.source, config.order === 'ascending')
            .map(get_post_meta_1.getPostMeta.bind(null, config.source))
            .filter(post => post.attachments.length));
        yield Promise.all(posts.map((post) => __awaiter(this, void 0, void 0, function* () { return process_post_1.processPost(postTemplate, blogTitle, source, target, maxImageDimension, lastModify, post); })));
        fs_1.writeFileSync(`${config.target}/index.html`, render_index_1.renderIndex(fs_1.readFileSync(config.indexTemplate, 'utf-8'), config.blogTitle, posts), 'utf-8');
        console.info(`\n ✅ Indexing complete for ${posts.length} posts`);
        if (config.versionFile) {
            update_version_1.updateVersion(config.versionFile);
        }
        if (config.execute && config.execute.length) {
            yield execute_1.execute(config.cwd, config.execute).catch(err => err);
        }
        return posts;
    });
}
exports.compile = compile;
// ================
function getPostList(source, sortAscending) {
    const files = fs_1.readdirSync(source)
        .filter((item) => fs_1.lstatSync(`${source}/${item}`).isDirectory())
        .sort();
    if (!sortAscending) {
        return files.reverse();
    }
    return files;
}
//# sourceMappingURL=simple-photo-blog.js.map