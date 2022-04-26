import { Rule } from "./Rule";

export class RequiredRule implements Rule {
  isValid(
    data: { [k: string]: any },
    field: string,
    params: Array<any>
  ): boolean {
    const value = data[field];

    if (value === undefined) {
      return false;
    }

    return value.length > 0;
  }

  getMessage(
    data: { [k: string]: any },
    field: string,
    params: Array<any>
  ): string {
    return `${field} is required.`;
  }
}
