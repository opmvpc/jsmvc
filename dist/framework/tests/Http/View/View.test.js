"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const View_1 = require("../../../View/View");
describe("Simple rendering", () => {
    it("should return empty string", () => {
        const view = new View_1.View("", {});
        expect(view.render()).toEqual("");
    });
    it("should return input", () => {
        const view = new View_1.View("<h1>Hello</h1>", {});
        expect(view.render()).toEqual("<h1>Hello</h1>");
    });
    it("should render a simple view", () => {
        const view = new View_1.View("Hello {{ this.name }}", { name: "World" });
        expect(view.render()).toEqual("Hello World");
    });
    it("should compile if statements", () => {
        const view = new View_1.View(`Hello
@if (this.name)
  World
@endif`, { name: "World" });
        expect(view.render()).toEqual(`Hello  World`);
    });
    it("should compile if statements with else", () => {
        const view = new View_1.View(`Hello
@if (this.name)
  World
@else
  Universe
@endif`, { name: false });
        expect(view.render()).toEqual(`Hello  Universe`);
    });
    it("should compile if statements with else if", () => {
        const view = new View_1.View(`Hello
@if (this.name)
  World
@else if (this.age)
  Universe
@endif`, { name: false, age: true });
        expect(view.render()).toEqual(`Hello  Universe`);
    });
    it("should compile simple for loop", () => {
        const view = new View_1.View(`Hello
@for (let i = 0; i < this.items.length; i++)
  {{ this.items[i] }}
@endfor`, { items: ["World", "Universe"] });
        expect(view.render()).toEqual(`Hello  World  Universe`);
    });
});
