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
const simple_photo_blog_1 = require("./simple-photo-blog");
const config_1 = require("./config");
execute();
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        console.info('==============================================================');
        const config = config_1.getConfig(getWorkingDirectory());
        if (config) {
            yield simple_photo_blog_1.compile(config);
        }
        console.info('==============================================================');
    });
}
function getWorkingDirectory() {
    const [executable, jsFile] = process.argv;
    if (jsFile === '/snapshot/bin/upload.js') {
        const path = executable.split('/');
        path.pop();
        return path.join('/');
    }
    return process.cwd();
}
//# sourceMappingURL=index.js.map