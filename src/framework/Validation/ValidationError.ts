export class ValidationError extends Error {
  public _errors: Map<string, string[]>;

  constructor() {
    super("Validation error: data does not match rules.");
    this._errors = new Map();
  }

  public get errors(): Map<string, string[]> {
    return this._errors;
  }

  public set errors(errors: Map<string, string[]>) {
    this._errors = errors;
  }
}
