"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = void 0;
class View {
    constructor(_template, _data, _templateName) {
        this._template = _template;
        this._data = _data;
        this._templateName = _templateName;
    }
    get template() {
        return this._template;
    }
    get data() {
        return this._data;
    }
    get templateName() {
        return this._templateName;
    }
}
exports.View = View;
