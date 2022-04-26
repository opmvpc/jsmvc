export interface Rule {
  isValid(
    data: { [k: string]: string },
    field: string,
    params: string[]
  ): boolean;
  getMessage(
    data: { [k: string]: string },
    field: string,
    params: string[]
  ): string;
}
