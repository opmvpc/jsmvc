"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const path_1 = __importDefault(require("path"));
const ViewManager_1 = require("../View/ViewManager");
const HttpContext_1 = require("./HttpContext/HttpContext");
const LocalStorage_1 = require("./HttpContext/LocalStorage/LocalStorage");
const Router_1 = require("./Router/Router");
class Server {
    constructor() {
        this._router = new Router_1.Router();
        this._viewManager = new ViewManager_1.ViewManager(path_1.default.resolve(__dirname, "../../../storage/framework/cache/views"));
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
        this.viewManager.emptyCacheDir();
        return http.createServer(function (req, res) {
            const state = new HttpContext_1.HttpContext(req, res, viewManager);
            return LocalStorage_1.storage.run(state, async () => {
                await router.dispatch();
            });
        });
    }
}
exports.Server = Server;
