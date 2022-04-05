"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = exports.view = void 0;
const Response_1 = require("../Http/Response");
const fs = require("fs");
function view(path, data) {
    const template = fs.readFileSync(path, "utf8");
    return (0, Response_1.response)(new View(template, data).render());
}
exports.view = view;
class View {
    constructor(template, data) {
        this.template = template;
        this.data = data;
        this.code = "";
    }
    render() {
        this.code = "var r=[];\\n";
        const moustachesRegex = /\{\{([^}]+)\}\}|@[^\(]+\(([^\)]+)\)|@endif|@endfor|@else/g;
        let cursor = 0;
        let match;
        let tokens = [];
        while ((match = moustachesRegex.exec(this.template)) !== null) {
            console.log(match);
            tokens.push(this.template.slice(cursor, match.index));
            tokens.push(match[0]);
            cursor = match.index + match[0].length;
        }
        console.log(tokens);
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.startsWith("@")) {
                this.addCode(token);
            }
            else if (token.startsWith("{{ ")) {
                this.addValue(token.slice(2, token.length - 2));
            }
            else {
                this.addText(token);
            }
        }
        this.addText(this.template.slice(cursor, this.template.length));
        this.code += 'return r.join("");';
        console.log(this.code.replace(/\\r|\\t|\\n/g, ""));
        const fn = new Function(this.code.replace(/\\r|\\t|\\n/g, ""));
        return fn.apply(this.data);
    }
    addText(line) {
        line = line.replace(/\n/g, "");
        this.code += 'r.push("' + line.replace(/"/g, '\\\\"') + '");';
    }
    addValue(line) {
        this.code += "r.push(" + line + ");";
    }
    addCode(line) {
        line = line.replace(/@if\s*\(([^\)]+)\)/, "if($1){");
        line = line.replace(/@elseif\s*\(([^\)]+)\)/, "}else if($1){");
        line = line.replace(/@else\s*/, "}else{");
        line = line.replace(/@endif/, "}");
        line = line.replace(/@for\s*\(([^\)]+)\)/, "for($1){");
        line = line.replace(/@endfor/, "}");
        this.code += line;
    }
}
exports.View = View;
