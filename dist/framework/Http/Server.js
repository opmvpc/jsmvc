"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const ViewManager_1 = require("../View/ViewManager");
const HttpContext_1 = require("./HttpContext/HttpContext");
const LocalStorage_1 = require("./HttpContext/LocalStorage/LocalStorage");
const Router_1 = require("./Router/Router");
class Server {
    constructor() {
        this._router = new Router_1.Router();
        this._viewManager = new ViewManager_1.ViewManager();
    }
    get router() {
        return this._router;
    }
    get viewManager() {
        return this._viewManager;
    }
    create() {
        const http = require("http");
        const router = this._router;
        const viewManager = this._viewManager;
        return http.createServer(function (req, res) {
            const state = new HttpContext_1.HttpContext(req, res, viewManager);
            return LocalStorage_1.storage.run(state, async () => {
                await router.dispatch();
            });
        });
    }
}
exports.Server = Server;
