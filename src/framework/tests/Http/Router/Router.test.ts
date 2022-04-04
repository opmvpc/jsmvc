import { response } from "../../../Http/Response";
import { Server } from "../../../Http/Server";
const supertest = require("supertest");

describe("Error handling", () => {
  it("should replace error handler", async () => {
    const server = new Server();
    server.router.get("/", () => {
      throw new Error("Oops!");
    });
    const res = await supertest(server.create()).get("/");
    expect(res.status).toBe(500);
    expect(res.text).toContain("Error: Oops!");

    server.router.setErrorHandler(500, () => response("Error: not Oops", 500));
    const res2 = await supertest(server.create()).get("/");
    expect(res2.status).toBe(500);
    expect(res2.text).toBe("Error: not Oops");
  });

  it("should detect not allowed error", async () => {
    const server = new Server();
    server.router.post("/", () => response("Hello World!"));
    const res = await supertest(server.create()).get("/");
    expect(res.status).toBe(400);
    expect(res.text).toBe("Method not allowed");
  });

  it("should dispatch error", async () => {
    const server = new Server();
    server.router.get("/", () => server.router.dispatchError());
    const res = await supertest(server.create()).get("/");
    expect(res.status).toBe(500);
    expect(res.text).toBe("Server error");
  });
});
