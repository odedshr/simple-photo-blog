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
const path_1 = require("path");
const Jimp = require("jimp");
const get_post_meta_1 = require("./get-post-meta");
const render_post_1 = require("./render-post");
const render_index_1 = require("./render-index");
const execute_1 = require("./execute");
const update_version_1 = require("./update-version");
function compile(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const postTemplate = fs_1.readFileSync(config.postTemplate, 'utf-8');
        const posts = yield Promise.all(getPostList(config.source, config.order === 'ascending')
            .map(get_post_meta_1.getPostMeta.bind(null, config.source))
            .filter(post => post.attachments.length)
            .map(addTargetFolder.bind(null, config.target))
            .map((post) => __awaiter(this, void 0, void 0, function* () { return processPost(postTemplate, config.source, config.overwrite, config.maxImageDimension, post); })));
        fs_1.writeFileSync(`${config.target}/index.html`, render_index_1.renderIndex(fs_1.readFileSync(config.indexTemplate, 'utf-8'), posts), 'utf-8');
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
function addTargetFolder(targetPath, post) {
    return Object.assign(Object.assign({}, post), { target: `${targetPath}/${post.slug}` });
}
function processPost(postTemplate, sourcePath, overwrite, maxImageDimension, post) {
    return __awaiter(this, void 0, void 0, function* () {
        const { slug, target, folder } = post;
        const isFolderExists = fs_1.existsSync(target);
        // if post didn't exist, copy its content
        if (overwrite || !isFolderExists) {
            !isFolderExists && fs_1.mkdirSync(target);
            const updateCount = yield copyPostAttachments(post.attachments, `${sourcePath}/${folder}`, target, maxImageDimension);
        }
        // if post index didn't exist, create it
        if (overwrite || !fs_1.existsSync(`${target}/index.html`)) {
            console.info(`\n 💾 Writing ${slug}`);
            const content = get_post_meta_1.getPostContent(post, path_1.join(sourcePath, folder));
            fs_1.writeFileSync(`${target}/index.html`, render_post_1.renderPost(postTemplate, Object.assign(Object.assign({}, post), { content })), 'utf-8');
        }
        return post;
    });
}
function copyPostAttachments(attachments, source, target, maxImageDimension) {
    return __awaiter(this, void 0, void 0, function* () {
        const updates = yield Promise.all(attachments
            .map((attachment) => __awaiter(this, void 0, void 0, function* () {
            if (attachment.link.indexOf('//') > -1) {
                return 0;
            }
            if (attachment.type === 'image' && !attachment.link.match(/\.svg$/) && maxImageDimension) {
                const image = yield Jimp.read(path_1.join(source, attachment.link));
                yield image.scaleToFit(maxImageDimension, maxImageDimension).writeAsync(path_1.join(target, attachment.link));
            }
            else {
                fs_1.copyFileSync(path_1.join(source, attachment.link), path_1.join(target, attachment.link));
            }
            return 1;
        })));
        return updates.reduce((sum, i) => (sum + i), 0);
    });
}
//# sourceMappingURL=simple-photo-blog.js.map