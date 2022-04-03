"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Response_1 = require("../../Http/Response");
const Server_1 = require("../../Http/Server");
const supertest = require("supertest");
describe("Server is responding correctly", () => {
    it("should return home page", async () => {
        const server = new Server_1.Server();
        server.router.get("/", () => (0, Response_1.response)("Hello World!"));
        const res = await supertest(server.create()).get("/");
        expect(res.status).toBe(200);
        expect(res.text).toBe("Hello World!");
    });
    it("should return json", async () => {
        const server = new Server_1.Server();
        server.router.get("/", () => (0, Response_1.jsonResponse)({ message: "Hello World!" }));
        const res = await supertest(server.create())
            .get("/")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res.body.message).toEqual("Hello World!");
    });
    it("should return server error", async () => {
        const server = new Server_1.Server();
        server.router.get("/", () => {
            throw new Error("Oops!");
        });
        const res = await supertest(server.create()).get("/").expect(500);
        expect(res.text).toContain("Error: Oops!");
    });
    it("should return 404", async () => {
        const server = new Server_1.Server();
        const res = await supertest(server.create()).get("/not-found");
        expect(res.status).toBe(404);
        expect(res.text).toBe("Not found");
    });
});
