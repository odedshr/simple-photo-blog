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
exports.execute = void 0;
const child_process_1 = require("child_process");
const colors_1 = require("./colors");
function execute(cwd, action) {
    return __awaiter(this, void 0, void 0, function* () {
        console.info(`\n 🕹  ${action}\n`);
        return new Promise((resolve, reject) => {
            child_process_1.exec(action, { cwd }, (error, stdout, stderr) => {
                if (error !== null) {
                    console.error(` 🛑  ${colors_1.Colors.FgRed}${error}${colors_1.Colors.Reset}`);
                    return reject(error);
                }
                console.info(' ✅ ', stdout, `${colors_1.Colors.FgYellow}${stderr}${colors_1.Colors.Reset}`);
                resolve(stdout);
            });
        });
    });
}
exports.execute = execute;
//# sourceMappingURL=execute.js.map