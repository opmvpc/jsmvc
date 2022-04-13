"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeController = void 0;
const ViewHelper_1 = require("../../../framework/View/ViewHelper");
class HomeController {
    async index() {
        return await (0, ViewHelper_1.view)("mixed", {
            users: [
                { name: "Jean Bauche", role: "admin" },
                { name: "Eli Kopter", role: "guest" },
            ],
        });
    }
}
exports.HomeController = HomeController;
