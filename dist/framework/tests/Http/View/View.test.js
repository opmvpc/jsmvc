"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewManager_1 = require("../../../View/ViewManager");
describe("Simple rendering", () => {
    it("should return empty string", () => {
        const viewManager = new ViewManager_1.ViewManager();
        viewManager.addPath(__dirname + "src/Framework/tests/View/TestTemplates");
        expect(viewManager.resolve("empty")).toEqual("");
    });
    it("should return input", () => {
        const viewManager = new ViewManager_1.ViewManager();
        viewManager.addPath("./TestTemplates");
        expect(viewManager.resolve("hello")).toEqual("<h1>Hello</h1>");
    });
    it("should render a simple view", () => {
        const viewManager = new ViewManager_1.ViewManager();
        viewManager.addPath("./TestTemplates");
        expect(viewManager.resolve("hello-world", { name: "World" })).toEqual("<h1>Hello</h1>");
    });
    it("should compile if statements", () => {
        const viewManager = new ViewManager_1.ViewManager();
        viewManager.addPath("./TestTemplates");
        expect(viewManager.resolve("single-if.html", { name: "World" })).toEqual("Hello  World");
    });
    //   it("should compile if statements with else", () => {
    //     const view = new View(
    //       `Hello
    // @if (this.name)
    //   World
    // @else
    //   Universe
    // @endif`,
    //       { name: false }
    //     );
    //     expect(view.render()).toEqual(`Hello  Universe`);
    //   });
    //   it("should compile if statements with else if", () => {
    //     const view = new View(
    //       `Hello
    // @if (this.name)
    //   World
    // @else if (this.age)
    //   Universe
    // @endif`,
    //       { name: false, age: true }
    //     );
    //     expect(view.render()).toEqual(`Hello  Universe`);
    //   });
    //   it("should compile simple for loop", () => {
    //     const view = new View(
    //       `Hello
    // @for (let i = 0; i < this.items.length; i++)
    //   {{ this.items[i] }}
    // @endfor`,
    //       { items: ["World", "Universe"] }
    //     );
    //     expect(view.render()).toEqual(`Hello  World  Universe`);
    //   });
});
