"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const Server_1 = require("../framework/Http/Server");
const server = new Server_1.Server();
server.start();
server.viewManager.addPath(__dirname + "/../../resources/views");
