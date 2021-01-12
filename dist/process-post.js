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
exports.processPost = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const Jimp = require("jimp");
const get_post_meta_1 = require("./get-post-meta");
const render_post_1 = require("./render-post");
//@ts-ignore
const JIMP = (!Jimp.read && Jimp.default) ? Jimp.default : Jimp;
function processPost(postTemplate, blogTitle, targetPath, maxImageDimension, expirationDate, post) {
    return __awaiter(this, void 0, void 0, function* () {
        const { slug, source } = post;
        try {
            const target = `${targetPath}/${slug}`;
            const postFile = `${target}/index.html`;
            const folderRequiresUpdate = isFolderRequireUpdate(source, target, expirationDate);
            const postModifyTime = getFileModifyDate(postFile);
            // if post index didn't exist, create it
            if (!folderRequiresUpdate) {
                console.info(`\n ✓ Skipping ${slug}`);
                return post;
            }
            console.info(`\n 💾 Writing ${slug}`);
            !fs_1.existsSync(target) && fs_1.mkdirSync(target);
            yield copyPostAttachments(post.attachments, source, target, maxImageDimension);
            if (!postModifyTime || postModifyTime > expirationDate) {
                const content = get_post_meta_1.getPostContent(post);
                fs_1.writeFileSync(`${target}/index.html`, render_post_1.renderPost(postTemplate, blogTitle, post, content), 'utf-8');
            }
        }
        catch (err) {
            console.error(` 🛑 Error processing post:\n${err}\n${JSON.stringify(post, null, 2)}`);
        }
        return post;
    });
}
exports.processPost = processPost;
function isFolderRequireUpdate(source, target, expirationDate) {
    const sourceModifyTime = getFileModifyDate(source);
    const targetModifyTime = getFileModifyDate(target);
    return !targetModifyTime ||
        targetModifyTime.getTime() < expirationDate.getTime() ||
        !sourceModifyTime ||
        sourceModifyTime.getTime() > targetModifyTime.getTime();
}
function getFileModifyDate(file) {
    if (fs_1.existsSync(file)) {
        return fs_1.lstatSync(file).mtime;
    }
    return false;
}
function copyPostAttachments(attachments, source, target, maxImageDimension) {
    return __awaiter(this, void 0, void 0, function* () {
        const updates = yield Promise.all(attachments
            .map((attachment) => __awaiter(this, void 0, void 0, function* () {
            if (attachment.link.indexOf('//') > -1) {
                return 0;
            }
            const imageSource = path_1.join(source, attachment.link);
            const imageTarget = path_1.join(target, attachment.link);
            if (attachment.type === 'image' && !attachment.link.match(/\.svg$/) && maxImageDimension) {
                const image = yield JIMP.read(imageSource);
                yield image.scaleToFit(maxImageDimension, maxImageDimension).writeAsync(imageTarget);
            }
            else {
                fs_1.copyFileSync(imageSource, imageTarget);
            }
            return 1;
        })));
        return updates.reduce((sum, i) => (sum + i), 0);
    });
}
//# sourceMappingURL=process-post.js.map