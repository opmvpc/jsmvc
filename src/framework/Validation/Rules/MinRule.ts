import { Rule } from "./Rule";

export class MinRule implements Rule {
  isValid(
    data: { [k: string]: string },
    field: string,
    params: Array<any>
  ): boolean {
    const value = data[field];
    const min = Number.parseInt(params[0]);

    if (isNaN(min)) {
      throw new Error("MinRule requires a minimum value.");
    }

    if (value === undefined) {
      return true;
    }

    return value.length >= min;
  }

  getMessage(
    data: { [k: string]: string },
    field: string,
    params: Array<any>
  ): string {
    const min = Number.parseInt(params[0]);

    return `${field} must be at least ${min} characters long.`;
  }
}
