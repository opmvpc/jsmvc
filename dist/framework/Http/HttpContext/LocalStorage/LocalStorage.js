"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const async_hooks_1 = require("async_hooks");
exports.storage = new async_hooks_1.AsyncLocalStorage();
