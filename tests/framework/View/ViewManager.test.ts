import { ViewManager } from "../../../src/framework/View/ViewManager";

describe("Simple rendering", () => {
  it("should return empty string", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(viewManager.resolve("static_templates/empty")).toEqual("");
  });

  it("should return input", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(viewManager.resolve("static_templates/hello")).toEqual(
      `<!DOCTYPE html>
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
</html>`
    );
  });

  it("should render a simple view", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(viewManager.resolve("hello-world", { name: "World" })).toEqual(
      `<h1>Hello World</h1>`
    );
  });

  it("should compile if statements", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(viewManager.resolve("single-if", { name: "World" })).toEqual(
      "Hello World "
    );
  });

  it("should compile if statements with else", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(viewManager.resolve("if-else", { name: false })).toEqual(
      "Hello Universe "
    );
  });

  it("should compile if statements with else if", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(viewManager.resolve("if-elseif", { name: false, age: 12 })).toEqual(
      "Hello Universe "
    );
  });

  it("should compile simple for loop", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(viewManager.resolve("for", { items: ["World", "Universe"] }))
      .toEqual(`<ul>
  <li>World</li>
  <li>Universe</li>
  </ul>`);
  });

  it("should throw an error if a template is not found", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(() => viewManager.resolve("not-found")).toThrowError(
      "Template 'not-found' not found"
    );
  });

  it("should render a layout and it's content", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(viewManager.resolve("with-layout", { name: "World" })).toEqual(
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello</title>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`
    );
  });
});
