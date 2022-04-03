"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
class Route {
    constructor(_method, _path, _handler) {
        this._method = _method;
        this._path = _path;
        this._handler = _handler;
    }
    get path() {
        return this._path;
    }
    get method() {
        return this._method;
    }
    get handler() {
        return this._handler;
    }
    matches(method, path) {
        return this._method === method && this._path === path;
    }
    dispatch() {
        return this._handler();
    }
}
exports.Route = Route;
