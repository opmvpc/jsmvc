import { response } from "../../Http/Response";
import { Server } from "../../Http/Server";
import { view } from "../../View/ViewHelper";
const supertest = require("supertest");

describe("view helper", () => {
  it("should return an html response", async () => {
    const server = new Server();
    server.router.get("/", () => view("hello"));
    server.viewManager.addPath(__dirname + "/TestTemplates");
    const res = await supertest(server.create()).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello</title>
  </head>
  <body>
    <h1>Hello</h1>
  </body>
</html>`);
  });
});
