"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const View_1 = require("./View");
const fs = require("fs");
class Engine {
    constructor() {
        /**
         * @info https://gomakethings.com/how-to-sanitize-third-party-content-with-vanilla-js-to-prevent-cross-site-scripting-xss-attacks/#sanitizing-by-encoding
         */
        this.escape = (line) => {
            return line.replace(/[^\w. ]/gi, function (c) {
                return "&#" + c.charCodeAt(0) + ";";
            });
        };
        this._manager = null;
    }
    setManager(manager) {
        this._manager = manager;
    }
    /**
     *
     * @param view view to render
     * @returns string of rendered html
     */
    render(view) {
        const template = fs.readFileSync(view.template, "utf8");
        const code = this.compile(template, view);
        return this.executeCode(code, view);
    }
    compile(template, view) {
        let tokens = this.getTokens(template);
        let code = this.generateCode(tokens, view.data);
        let { layoutPath, layoutName } = this.getLayoutPathAndName(template);
        if (layoutPath !== "") {
            return this.renderViewWithLayout(code, view, layoutPath, layoutName);
        }
        return code;
    }
    renderViewWithLayout(code, view, layoutPath, templateName) {
        const content = this.executeCode(code, view);
        const layoutView = new View_1.View(layoutPath, {
            content: content,
        }, templateName);
        return this.addText(this.render(layoutView));
    }
    generateCode(tokens, data) {
        let code = "";
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (Engine.INCLUDE_REGEX.test(token)) {
                code += this.include(token, data);
            }
            else if (token.startsWith("@")) {
                code += this.addDirective(token);
            }
            else if (token.startsWith("{{")) {
                code += this.addEscapedValue(token.slice(2, token.length - 2));
            }
            else if (token.startsWith("{!!")) {
                code += this.addValue(token.slice(3, token.length - 3));
            }
            else {
                code += this.addText(token);
            }
        }
        return code;
    }
    include(line, data) {
        // include partial
        let match = line.match(Engine.INCLUDE_REGEX);
        if (match !== null) {
            let [partialTemplate, partialData] = match[1].split(",");
            partialTemplate = partialTemplate.replace(/['"]+/g, "");
            partialData = JSON.parse(JSON.stringify(partialData));
            const partialDataObject = new Function("return " + partialData).apply(data);
            const partialPath = this._manager?.resolvePath(partialTemplate);
            const partialView = new View_1.View(partialPath, partialDataObject, partialTemplate);
            return this.addText(this.render(partialView));
        }
        return "";
    }
    getTokens(template) {
        const tokensRegex = Engine.TOKENS_REGEX;
        let cursor = 0;
        let match;
        let tokens = [];
        while ((match = tokensRegex.exec(template)) !== null) {
            tokens.push(template.slice(cursor, match.index));
            tokens.push(match[0]);
            cursor = match.index + match[0].length;
        }
        const endOfTemplate = template.slice(cursor).trimEnd();
        tokens.push(endOfTemplate);
        return tokens;
    }
    executeCode(code, view) {
        code = "const r=[];" + code + "return r.join('');";
        let data = this.addMacrosToViewData(view);
        let html = "";
        try {
            console.log(code);
            html = new Function(code).apply(data);
            html = html.replace(/__r__/g, "\r");
            html = html.replace(/__t__/g, "\t");
            html = html.replace(/__n__/g, "\n");
            console.log(html);
            return html;
        }
        catch (error) {
            throw new Error(`Error in view '${view.templateName}': ${error}`);
        }
    }
    addMacrosToViewData(view) {
        let data = view.data;
        data["escape"] = this.escape;
        for (const [key, value] of this._manager.macros) {
            data[key] = value;
        }
        return data;
    }
    addText(line) {
        line = line.replace(/\r/g, "__r__");
        line = line.replace(/\t/g, "__t__");
        line = line.replace(/\n/g, "__n__");
        return 'r.push("' + line.replace(/"/g, '\\"') + '");';
    }
    addValue(line) {
        return "r.push(" + line + ");";
    }
    addEscapedValue(line) {
        return "r.push(this.escape(" + line + "));";
    }
    addDirective(line) {
        line = line.replace(Engine.IF_REGEX, "if($1){");
        line = line.replace(Engine.ELSE_REGEX, "}else{");
        line = line.replace(Engine.ELSEIF_REGEX, "}else if($1){");
        line = line.replace(Engine.ENDIF_REGEX, "}");
        line = line.replace(Engine.FOR_REGEX, "for($1){");
        line = line.replace(Engine.ENDFOR_REGEX, "}");
        // extends layout
        line = line.replace(Engine.EXTENDS_REGEX, "");
        // call macro by directive
        line = line.replace(Engine.MACRO_REGEX, this.addValue("this.$1($2)"));
        return line;
    }
    getLayoutPathAndName(template) {
        const match = template.match(Engine.EXTENDS_REGEX);
        if (match !== null && this._manager !== null) {
            const layout = match[1].replace(/['"]+/g, "");
            return {
                layoutPath: this._manager.resolvePath(layout),
                layoutName: layout,
            };
        }
        return {
            layoutPath: "",
            layoutName: "",
        };
    }
}
exports.Engine = Engine;
Engine.TOKENS_REGEX = /\{\{([^}]+)\}\}|\{\!\!([^!]+)\!\!\}|(@[^\(]+\(([^\)]+)\)|@endif|@endfor|@else)\s*/g;
Engine.INCLUDE_REGEX = /@include\s*\(([^\)]+)\)/;
Engine.IF_REGEX = /@if\s*\(([^\)]+)\)/;
Engine.ELSE_REGEX = /@else\s*/;
Engine.ELSEIF_REGEX = /@elseif\s*\(([^\)]+)\)/;
Engine.ENDIF_REGEX = /@endif/;
Engine.FOR_REGEX = /@for\s*\(([^\)]+)\)/;
Engine.ENDFOR_REGEX = /@endfor/;
Engine.EXTENDS_REGEX = /@extends\s*\(([^\)]+)\)/;
Engine.MACRO_REGEX = /@([^\(]+)\s*\(([^\)]+)\)/;
