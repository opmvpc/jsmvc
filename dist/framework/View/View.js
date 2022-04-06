"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = void 0;
class View {
    constructor(_template, _data) {
        this._template = _template;
        this._data = _data;
    }
    get template() {
        return this._template;
    }
    get data() {
        return this._data;
    }
}
exports.View = View;
