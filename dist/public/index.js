"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const web_1 = require("../app/routes/web");
const Server_1 = require("../framework/Http/Server");
const server = new Server_1.Server();
(0, web_1.registerRoutes)(server.router);
server.viewManager.addPath(__dirname + "/../../resources/views");
server.create().listen(process.env.PORT || 8000);
