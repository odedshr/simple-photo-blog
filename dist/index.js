"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simple_photo_blog_1 = require("./simple-photo-blog");
const config_1 = require("./config");
console.info('==============================================================');
const config = config_1.getConfig(getWorkingDirectory());
if (config) {
    simple_photo_blog_1.compile(config);
}
console.info('==============================================================');
// ================
function getWorkingDirectory() {
    const [executable, jsFile] = process.argv;
    if (jsFile === '/snapshot/dist/index.js') {
        const path = executable.split('/');
        path.pop();
        return path.join('/');
    }
    return process.cwd();
}
//# sourceMappingURL=index.js.map