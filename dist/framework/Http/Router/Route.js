"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const HttpContext_1 = require("../HttpContext/HttpContext");
class Route {
    constructor(_method, _path, _handler) {
        this._method = _method;
        this._path = _path;
        this._handler = _handler;
        this._params = new Map();
    }
    setName(name) {
        this._name = name;
        return this;
    }
    get name() {
        return this._name;
    }
    get path() {
        return this._path;
    }
    get method() {
        return this._method;
    }
    matches(method, path) {
        // literal match
        if (this.path === path && this.method === method) {
            return true;
        }
        var { pattern, paramsName } = this.getParamsNamesAndReplaceNamesByPatterns();
        if (!pattern.includes("+") && !pattern.includes("*")) {
            return false;
        }
        const paramsValues = this.getParamsValues(pattern, path);
        if (paramsValues.length > 0) {
            this.addParamsToRoute(paramsName, paramsValues);
            return true;
        }
        return false;
    }
    getParamsNamesAndReplaceNamesByPatterns() {
        const paramsName = [];
        let pattern = Route.normalizePath(this.path);
        pattern = pattern.replace(/\{([^}]+)\}\//g, (match, key) => {
            paramsName.push(key.replace("?", ""));
            if (key.endsWith("?")) {
                return "([^/]*)(?:/?)";
            }
            return "([^/]+)/";
        });
        return { pattern, paramsName };
    }
    getParamsValues(pattern, path) {
        const paramsValues = [];
        let matches;
        if ((matches = new RegExp(pattern).exec(Route.normalizePath(path))) !== null) {
            matches.forEach((match, groupIndex) => {
                if (groupIndex > 0) {
                    paramsValues.push(match);
                }
            });
        }
        return paramsValues;
    }
    addParamsToRoute(paramsName, paramsValues) {
        for (let i = 0; i < paramsName.length; i++) {
            let value;
            if (paramsValues[i] === "") {
                value = null;
            }
            else if (/^\d+$/.test(paramsValues[i])) {
                value = parseInt(paramsValues[i]);
            }
            else {
                value = paramsValues[i];
            }
            this._params.set(paramsName[i], value);
        }
    }
    static normalizePath(path) {
        if (path.startsWith("/")) {
            path = path.substring(1, path.length);
        }
        if (path.endsWith("/")) {
            path = path.substring(0, path.length - 1);
        }
        path = `/${path}/`;
        path = path.replace(/[\/]{2,}/g, "/");
        return path;
    }
    dispatch() {
        const ctx = HttpContext_1.HttpContext.get();
        if (this._handler instanceof Function) {
            return this._handler(ctx);
        }
        const [controller, action] = this._handler;
        return controller[action](ctx);
    }
    get params() {
        return this._params;
    }
}
exports.Route = Route;
