"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewManager = void 0;
const Engine_1 = require("./Engine");
const View_1 = require("./View");
const pathManager = require("path");
const fs = require("fs");
class ViewManager {
    constructor() {
        this.VIEWCACHEDIR = "../../../storage/framework/cache/views";
        this._paths = [];
        this._engine = new Engine_1.Engine();
        this._engine.setManager(this);
        this._macros = new Map();
        this._templates = new Map();
        this.emptyCacheDir();
    }
    addPath(path) {
        this._paths.push(path);
        return this;
    }
    resolve(template, data = {}) {
        const hash = this.hashName(template);
        const filePath = this.resolvePath(template);
        if (!this._templates.has(hash)) {
            const compiledView = this._engine.render(new View_1.View(filePath, data, template));
            return compiledView;
        }
        const code = fs.readFileSync(this._templates.get(hash), "utf8");
        return this._engine.executeCode(code, data, hash);
    }
    hashName(template) {
        const crypto = require("crypto");
        return crypto.createHash("md5").update(template).digest("hex");
    }
    resolvePath(template) {
        const templateName = template.replace(/\./g, "/");
        for (const path of this._paths) {
            const filePath = pathManager.resolve(path, templateName + ".html");
            //check if file exists
            if (fs.existsSync(filePath)) {
                return filePath;
            }
        }
        throw new Error(`Template '${template}' not found`);
    }
    addMacro(name, macro) {
        this._macros.set(name, macro);
        return this;
    }
    get macros() {
        return this._macros;
    }
    putCodeInCache(templateName, code) {
        const hash = this.hashName(templateName);
        //save code in a cache file
        const fileName = pathManager.resolve(__dirname, this.VIEWCACHEDIR, hash + ".js");
        fs.writeFileSync(fileName, code);
        this._templates.set(hash, fileName);
    }
    emptyCacheDir() {
        const dirPath = pathManager.resolve(__dirname, this.VIEWCACHEDIR);
        fs.readdirSync(dirPath).forEach((file) => {
            fs.unlinkSync(pathManager.resolve(dirPath, file));
        });
        this._templates.clear();
    }
}
exports.ViewManager = ViewManager;
