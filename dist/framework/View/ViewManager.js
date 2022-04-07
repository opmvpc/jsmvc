"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewManager = void 0;
const Engine_1 = require("./Engine");
const View_1 = require("./View");
const pathManager = require("path");
const fs = require("fs");
class ViewManager {
    constructor() {
        this.paths = [];
        this.engine = new Engine_1.Engine(this);
    }
    addPath(path) {
        this.paths.push(path);
        return this;
    }
    resolve(template, data = {}) {
        const filePath = this.resolvePath(template);
        return this.engine.render(new View_1.View(filePath, data));
    }
    resolvePath(template) {
        for (const path of this.paths) {
            const filePath = pathManager.resolve(path, template + ".html");
            //check if file exists
            if (fs.existsSync(filePath)) {
                return filePath;
            }
        }
        throw new Error(`Template '${template}' not found`);
    }
}
exports.ViewManager = ViewManager;
