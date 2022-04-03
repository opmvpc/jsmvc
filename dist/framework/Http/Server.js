"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const HttpContext_1 = require("./HttpContext/HttpContext");
const LocalStorage_1 = require("./HttpContext/LocalStorage/LocalStorage");
const Router_1 = require("./Router/Router");
class Server {
    constructor() {
        this._router = new Router_1.Router();
    }
    get router() {
        return this._router;
    }
    create() {
        const http = require("http");
        const router = this._router;
        return http.createServer(function (req, res) {
            const state = new HttpContext_1.HttpContext(req, res);
            return LocalStorage_1.storage.run(state, async () => {
                await router.dispatch();
            });
        });
    }
    start() {
        this.create().listen(process.env.PORT || 8000);
    }
}
exports.Server = Server;
