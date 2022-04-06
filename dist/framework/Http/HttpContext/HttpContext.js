"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpContext = void 0;
const LocalStorage_1 = require("./LocalStorage/LocalStorage");
class HttpContext {
    constructor(_request, _response, _viewManager) {
        this._request = _request;
        this._response = _response;
        this._viewManager = _viewManager;
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
    get viewManager() {
        return this._viewManager;
    }
}
exports.HttpContext = HttpContext;
