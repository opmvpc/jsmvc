import { response } from "../Http/Response";
const fs = require("fs");

export function view(path: string, data: {}): any {
  const template = fs.readFileSync(path, "utf8");

  return response(new View(template, data).render());
}

export class View {
  private template: string;
  private data: {};
  private code: string;

  constructor(template: string, data: {}) {
    this.template = template;
    this.data = data;
    this.code = "";
  }

  render(): any {
    this.code = "var r=[];\\n";
    const moustachesRegex =
      /\{\{([^}]+)\}\}|@[^\(]+\(([^\)]+)\)|@endif|@endfor|@else/g;
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
      } else if (token.startsWith("{{ ")) {
        this.addValue(token.slice(2, token.length - 2));
      } else {
        this.addText(token);
      }
    }
    this.addText(this.template.slice(cursor, this.template.length));
    this.code += 'return r.join("");';

    console.log(this.code.replace(/\\r|\\t|\\n/g, ""));

    const fn = new Function(this.code.replace(/\\r|\\t|\\n/g, ""));
    return fn.apply(this.data);
  }

  private addText(line: string) {
    line = line.replace(/\n/g, "");
    this.code += 'r.push("' + line.replace(/"/g, '\\\\"') + '");';
  }

  private addValue(line: string) {
    this.code += "r.push(" + line + ");";
  }

  private addCode(line: string) {
    line = line.replace(/@if\s*\(([^\)]+)\)/, "if($1){");
    line = line.replace(/@elseif\s*\(([^\)]+)\)/, "}else if($1){");
    line = line.replace(/@else\s*/, "}else{");
    line = line.replace(/@endif/, "}");

    line = line.replace(/@for\s*\(([^\)]+)\)/, "for($1){");
    line = line.replace(/@endfor/, "}");

    this.code += line;
  }
}
