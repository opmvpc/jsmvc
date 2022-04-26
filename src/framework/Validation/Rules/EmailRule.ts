import { Rule } from "./Rule";

export class EmailRule implements Rule {
  isValid(
    data: { [k: string]: string },
    field: string,
    params: Array<any>
  ): boolean {
    const value = data[field];

    if (value === undefined) {
      return true;
    }

    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(value).toLowerCase());
  }

  getMessage(
    data: { [k: string]: string },
    field: string,
    params: Array<any>
  ): string {
    return `${field} must be a valid email address.`;
  }
}
