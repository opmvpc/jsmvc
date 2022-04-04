"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const web_1 = require("../../../app/routes/web");
const HttpContext_1 = require("../HttpContext/HttpContext");
const Response_1 = require("../Response");
const Route_1 = require("./Route");
class Router {
    constructor() {
        this.routes = [];
        this.errorHandler = new Map();
        if (process.env.NODE_ENV !== "test") {
            (0, web_1.registerRoutes)(this);
        }
    }
    add(method, path, handler) {
        const route = new Route_1.Route(method, path, handler);
        this.routes.push(route);
        return route;
    }
    get(path, handler) {
        return this.add("GET", path, handler);
    }
    post(path, handler) {
        return this.add("POST", path, handler);
    }
    async dispatch() {
        const requestMethod = HttpContext_1.HttpContext.get()?.request.method;
        const requestPath = HttpContext_1.HttpContext.get()?.request.url;
        const matching = this.match(requestMethod, requestPath);
        if (matching) {
            try {
                HttpContext_1.HttpContext.get().currentRoute = matching;
                return matching.dispatch();
            }
            catch (error) {
                return this.dispatchError(error);
            }
        }
        if (this.paths().includes(requestPath)) {
            return this.dispatchNotAllowed();
        }
        return this.dispatchNotFound();
    }
    match(method, path) {
        for (const route of this.routes) {
            if (route.matches(method, path)) {
                return route;
            }
        }
        return null;
    }
    paths() {
        return this.routes.map((route) => route.path);
    }
    setErrorHandler(code, handler) {
        this.errorHandler.set(code, handler);
    }
    dispatchNotAllowed() {
        if (this.errorHandler.get(400) === undefined) {
            this.errorHandler.set(400, () => (0, Response_1.response)("Method not allowed", 400));
        }
        return this.errorHandler.get(400)?.();
    }
    dispatchNotFound() {
        if (this.errorHandler.get(404) === undefined) {
            this.errorHandler.set(404, () => (0, Response_1.response)("Not found", 404));
        }
        return this.errorHandler.get(404)?.();
    }
    dispatchError(error) {
        if (this.errorHandler.get(500) === undefined) {
            this.errorHandler.set(500, () => {
                if (error) {
                    return (0, Response_1.response)(`Server error:
        <br> ${error?.stack}`, 500);
                }
                return (0, Response_1.response)("Server error", 500);
            });
        }
        return this.errorHandler.get(500)?.();
    }
    redirect(path) {
        const response = HttpContext_1.HttpContext.get()?.response;
        response.writeHead(302, {
            location: path,
        });
        response.end();
    }
}
exports.Router = Router;
