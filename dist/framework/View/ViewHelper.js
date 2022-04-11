"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.view = void 0;
const HttpContext_1 = require("../Http/HttpContext/HttpContext");
const Response_1 = require("../Http/Response");
async function view(path, data = {}) {
    return (0, Response_1.response)(await HttpContext_1.HttpContext.get()?.viewManager.resolve(path, data));
}
exports.view = view;
