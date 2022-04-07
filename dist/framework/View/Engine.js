"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const View_1 = require("./View");
const fs = require("fs");
class Engine {
    constructor(_manager) {
        this._manager = _manager;
    }
    /**
     *
     * @param view view to render
     * @returns string of rendered html
     */
    render(view) {
        const template = fs.readFileSync(view.template, "utf8");
        let tokens = this.getTokens(template);
        let code = this.generateCode(tokens);
        let layoutPath = this.getLayoutPath(template);
        if (layoutPath !== "") {
            return this.renderViewWithLayout(code, view, layoutPath);
        }
        return this.executeCode(code, view);
    }
    renderViewWithLayout(code, view, layoutPath) {
        const content = this.executeCode(code, view);
        const layoutView = new View_1.View(layoutPath, {
            content: content,
        });
        return this.render(layoutView);
    }
    generateCode(tokens) {
        let code = "";
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.startsWith("@")) {
                code += this.addCode(token);
            }
            else if (token.startsWith("{{ ")) {
                code += this.addValue(token.slice(2, token.length - 2));
            }
            else {
                code += this.addText(token);
            }
        }
        return code;
    }
    getTokens(template) {
        const tokensRegex = /\{\{([^}]+)\}\}|(@[^\(]+\(([^\)]+)\)|@endif|@endfor|@else)\s*/g;
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
        let html = new Function(code).apply(view.data);
        html = html.replace(/__r__/g, "\r");
        html = html.replace(/__t__/g, "\t");
        html = html.replace(/__n__/g, "\n");
        return html;
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
    addCode(line) {
        line = line.replace(/@if\s*\(([^\)]+)\)/, "if($1){");
        line = line.replace(/@elseif\s*\(([^\)]+)\)/, "}else if($1){");
        line = line.replace(/@else\s*/, "}else{");
        line = line.replace(/@endif/, "}");
        line = line.replace(/@for\s*\(([^\)]+)\)/, "for($1){");
        line = line.replace(/@endfor/, "}");
        line = line.replace(/@extends\s*\(([^\)]+)\)/, "");
        return line;
    }
    getLayoutPath(template) {
        const match = template.match(/@extends\s*\('([^']+)'\)/);
        if (match !== null) {
            return this._manager.resolvePath(match[1]);
        }
        return "";
    }
}
exports.Engine = Engine;
