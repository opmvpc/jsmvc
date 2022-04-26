import { EmailRule } from "./Rules/EmailRule";
import { MinRule } from "./Rules/MinRule";
import { RequiredRule } from "./Rules/RequiredRule";
import { ValidationManager } from "./ValidationManager";

export const validate = (
  data: { [k: string]: any },
  rules: { [k: string]: string[] }
): { [k: string]: any } => {
  const validationManager: ValidationManager = new ValidationManager();
  validationManager.addRule("email", new EmailRule());
  validationManager.addRule("min", new MinRule());
  validationManager.addRule("required", new RequiredRule());

  return validationManager.validate(data, rules);
};
