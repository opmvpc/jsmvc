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
        this.engine = new Engine_1.Engine();
    }
    addPath(path) {
        this.paths.push(path);
        return this;
    }
    resolve(template, data = {}) {
        for (const path of this.paths) {
            const filePath = pathManager.resolve(path, template + ".html");
            //check if file exists
            if (fs.existsSync(filePath)) {
                return this.engine.render(new View_1.View(filePath, data));
            }
        }
        throw new Error("Template not found");
    }
}
exports.ViewManager = ViewManager;
