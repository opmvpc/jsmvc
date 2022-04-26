import { Rule } from "./Rules/Rule";
import { ValidationError } from "./ValidationError";

export class ValidationManager {
  private _rules: Map<string, Rule>;

  constructor() {
    this._rules = new Map();
  }

  public addRule(key: string, rule: Rule): void {
    this._rules.set(key, rule);
  }

  validate(
    data: { [k: string]: any },
    rules: { [k: string]: string[] }
  ): { [k: string]: any } {
    const errors: Map<string, string[]> = new Map();
    for (const field in data) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        for (const rule of rules[field]) {
          const ruleParts = rule.split(":");
          const ruleKey = ruleParts[0];
          const ruleParams = ruleParts.slice(1);
          const ruleInstance = this._rules.get(ruleKey);
          if (ruleInstance === undefined) {
            throw new Error(`Rule ${ruleKey} not found.`);
          }
          if (!ruleInstance.isValid(data, field, ruleParams)) {
            if (!errors.has(field)) {
              errors.set(field, []);
            }
            errors
              .get(field)!
              .push(ruleInstance.getMessage(data, field, ruleParams));
          }
        }
      }
    }
    if (errors.size > 0) {
      const error: ValidationError = new ValidationError();
      error.errors = errors;
      throw error;
    }

    const validated: { [key: string]: any } = {};
    for (const field in rules) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        validated[field] = data[field];
      }
    }
    return validated;
  }
}
