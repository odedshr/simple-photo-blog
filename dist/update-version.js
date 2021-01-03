"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVersion = void 0;
const fs_1 = require("fs");
function updateVersion(filename) {
    if (!fs_1.existsSync(filename)) {
        console.error(` ⚠️ version file not found: ${filename}`);
        return;
    }
    const fileContent = fs_1.readFileSync(filename, 'utf-8');
    try {
        const jsonObject = JSON.parse(fileContent);
        const version = jsonObject.version.split('.');
        version[2] = (+version[2]) + 1;
        jsonObject.version = version.join('.');
        fs_1.writeFileSync(filename, JSON.stringify(jsonObject, null, 2), 'utf-8');
    }
    catch (err) {
        console.error(` ⚠️ failed to update version (${filename}):`, err);
        return;
    }
    console.info(`\n 🔢 Updated version`);
}
exports.updateVersion = updateVersion;
//# sourceMappingURL=update-version.js.map