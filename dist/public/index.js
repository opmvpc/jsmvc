"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const Server_1 = require("../framework/Http/Server");
new Server_1.Server().start();
