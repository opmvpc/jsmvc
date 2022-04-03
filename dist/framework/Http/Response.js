"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonResponse = exports.response = void 0;
const HttpContext_1 = require("./HttpContext/HttpContext");
const response = (body, status = 200, header = { "Content-Type": "text/html" }) => {
    const response = HttpContext_1.HttpContext.get()?.response;
    response.writeHead(status, header);
    response.write(body);
    response.end();
};
exports.response = response;
const jsonResponse = (body, status = 200, header = { "Content-Type": "application/json" }) => {
    const response = HttpContext_1.HttpContext.get()?.response;
    response.writeHead(status, header);
    response.write(JSON.stringify(body));
    response.end();
};
exports.jsonResponse = jsonResponse;
