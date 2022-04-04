"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpContext = void 0;
const LocalStorage_1 = require("./LocalStorage/LocalStorage");
class HttpContext {
    constructor(_request, _response) {
        this._request = _request;
        this._response = _response;
    }
    static get() {
        return LocalStorage_1.storage.getStore();
    }
    get request() {
        return this._request;
    }
    get response() {
        return this._response;
    }
    get currentRoute() {
        return this._currentRoute;
    }
    set currentRoute(route) {
        this._currentRoute = route;
    }
}
exports.HttpContext = HttpContext;
