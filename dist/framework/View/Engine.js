"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const fs = require("fs");
class Engine {
    /**
     *
     * @param view view to render
     * @returns string of rendered html
     */
    render(view) {
        const template = fs.readFileSync(view.template, "utf8");
        let tokens = this.getTokens(template);
        // console.log(tokens);
        let code = this.generateCode(tokens);
        // console.log(code);
        return this.executeCode(code, view);
    }
    generateCode(tokens) {
        let code = "var r=[];";
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
        code += 'return r.join("");';
        return code;
    }
    getTokens(template) {
        const tokensRegex = /\{\{([^}]+)\}\}|@[^\(]+\(([^\)]+)\)\s*|@endif\s*|@endfor\s*|@else\s*/g;
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
        return line;
    }
}
exports.Engine = Engine;
