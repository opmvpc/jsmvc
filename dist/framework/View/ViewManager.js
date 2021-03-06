"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewManager = void 0;
const Engine_1 = require("./Engine");
const View_1 = require("./View");
const pathManager = require("path");
const fs = require("fs");
class ViewManager {
    constructor(cacheDir) {
        this._paths = [];
        this._engine = new Engine_1.Engine();
        this._engine.setManager(this);
        this._macros = new Map();
        this._templates = new Map();
        this._cacheDir = cacheDir;
        this.ensureFolderExists(this._cacheDir);
    }
    addPath(path) {
        this._paths.push(path);
        return this;
    }
    async resolve(template, data = {}) {
        const hash = this.hashName(template);
        const filePath = this.resolvePath(template);
        if (!this._templates.has(hash)) {
            const compiledView = this._engine.render(new View_1.View(filePath, data, template));
            return compiledView;
        }
        const code = await this.readCachedTemplate(this._templates.get(hash));
        return await this._engine.executeCode(code, data, hash);
    }
    readCachedTemplate(cachedTemplatePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(cachedTemplatePath, "utf8", (err, code) => {
                if (err) {
                    reject(err);
                }
                resolve(code);
            });
        });
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
    async putCodeInCache(templateName, code) {
        const hash = this.hashName(templateName);
        //save code in a cache file
        const fileName = pathManager.resolve(this._cacheDir, hash + ".js");
        await this.writeInfile(fileName, code);
        this._templates.set(hash, fileName);
    }
    writeInfile(fileName, code) {
        return new Promise((resolve, reject) => {
            fs.writeFile(fileName, code, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
    ensureFolderExists(path, mask = 0o755) {
        try {
            fs.mkdirSync(path, mask);
        }
        catch (error) {
            if (error.code !== "EEXIST") {
                throw error;
            }
        }
    }
    get cacheDir() {
        return this._cacheDir;
    }
    set cacheDir(value) {
        this._cacheDir = value;
    }
}
exports.ViewManager = ViewManager;
