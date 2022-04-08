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
    expect(viewManager.resolve("static_templates.hello")).toEqual(
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

  it("should preserve space characters in data values", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(viewManager.resolve("hello-world", { name: "\nWorld" })).toEqual(
      `<h1>Hello &#10;World</h1>`
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
    expect(
      viewManager.resolve("with-layout", { name: "<h1>Hello World</h1>" })
    ).toEqual(
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello</title>
  </head>
  <body>
    &#60;h1&#62;Hello World&#60;&#47;h1&#62;
  </body>
</html>`
    );
  });

  it("should include and render content", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(viewManager.resolve("include.include", { name: "hello-world" }))
      .toEqual(`<section><h1>Include</h1>
<p>hello&#45;world</p></section>`);
  });

  it("should escape html", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(
      viewManager.resolve("escape", { name: "<script>alert('hello')</script>" })
    ).toEqual(`<div>
  <h1>&#60;script&#62;alert&#40;&#39;hello&#39;&#41;&#60;&#47;script&#62;</h1>
</div>`);
  });

  it("should not escape html", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(
      viewManager.resolve("no-escape", {
        name: "<script>alert('hello')</script>",
      })
    ).toEqual(`<div>
  <h1><script>alert('hello')</script></h1>
</div>`);
  });

  it("should render mixed templates", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(
      viewManager.resolve("mixed", {
        users: [
          { name: "Jean Bauche", role: "admin" },
          { name: "Eli Kopter", role: "guest" },
        ],
      })
    ).toEqual(
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello</title>
  </head>
  <body>
    <div>
  <div>
    <h1>Jean Bauche</h1>
    <h2>admin</h2>
    </div>
  <div>
    <h1>Eli Kopter</h1>
    </div>
  </div>
  </body>
</html>`
    );
  });
});

describe("Macros", () => {
  it("should use a registered macro", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    viewManager.addMacro("hello", (name) => `Hello ${name}`);
    expect(viewManager.resolve("macros.hello", { name: "World" })).toEqual(
      `Hello World`
    );
  });

  it("should use a registered macro using directive syntax", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    viewManager.addMacro("hello", (name) => `Hello ${name}`);
    expect(
      viewManager.resolve("macros.hello-directive", { name: "World" })
    ).toEqual(`Hello World`);
  });

  it("should throw an error if a macro is not found", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    expect(() =>
      viewManager.resolve("macros.not-found", { name: "World" })
    ).toThrowError(
      "Error in view 'macros.not-found': TypeError: this.notFound is not a function"
    );
  });
});

describe("View cache", () => {
  it("should cache a view", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    viewManager.resolve("hello-world", { name: "World" });
    const fs = require("fs");
    const path = require("path");
    const hash = viewManager.hashName("hello-world");
    const filePath = path.resolve(
      __dirname,
      viewManager.VIEWCACHEDIR,
      hash + ".js"
    );
    expect(fs.existsSync(filePath)).toBeTruthy();
  });

  it("should use cache", () => {
    const viewManager = new ViewManager();
    viewManager.addPath(__dirname + "/test_templates");
    viewManager.resolve("hello-world", { name: "World" });
    viewManager.resolve("hello-world", { name: "World" });
  });
});
