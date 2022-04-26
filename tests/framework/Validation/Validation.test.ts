import { ValidationError } from "../../../src/framework/Validation/ValidationError";
import { validate } from "../../../src/framework/Validation/ValidationHelper";

describe("Rule does not exist", () => {
  it("should throw an error if rule does not exist", () => {
    const data = {
      email: "test",
    };
    const rules = {
      email: ["not-a-valid-rule"],
    };
    expect(() => {
      validate(data, rules);
    }).toThrowError("Rule not-a-valid-rule not found.");
  });
});

describe("Email Rule", () => {
  it("should validate an email", () => {
    const validatedData = validate(
      { email: "test@test.com" },
      { email: ["email"] }
    );
    expect(validatedData.email).toBe("test@test.com");
  });

  it("should throw a ValidationError if email is invalid", async () => {
    expect(() =>
      validate({ email: "test" }, { email: ["email"] })
    ).toThrowError(ValidationError);
  });

  it("should validate an empty email", async () => {
    const validatedData = validate({ email: undefined }, { email: ["email"] });
    expect(validatedData.email).toBe(undefined);
  });
});

describe("Required Rule", () => {
  it("should validate filled field", () => {
    const validatedData = validate({ name: "test" }, { name: ["required"] });
    expect(validatedData.name).toBe("test");
  });

  it("should throw a ValidationError if string is empty", async () => {
    expect(() => validate({ name: "" }, { name: ["required"] })).toThrowError(
      ValidationError
    );
  });

  it("should throw a ValidationError if string is undifined", async () => {
    expect(() =>
      validate({ name: undefined }, { name: ["required"] })
    ).toThrowError(ValidationError);
  });
});

describe("Min Rule", () => {
  it("should validate a string", () => {
    let validatedData = validate({ name: "test" }, { name: ["min:4"] });
    expect(validatedData.name).toBe("test");
    validatedData = validate({ name: "test" }, { name: ["min:3"] });
    expect(validatedData.name).toBe("test");
  });

  it("should throw a ValidationError if string length is invalid", async () => {
    expect(() => validate({ name: "test" }, { name: ["min:5"] })).toThrowError(
      ValidationError
    );
  });

  it("should throw an Error if argument is not provided", async () => {
    expect(() => validate({ name: "test" }, { name: ["min"] })).toThrowError(
      "MinRule requires a minimum value."
    );
  });

  it("should validate a undefined value", async () => {
    const validatedData = validate({ name: undefined }, { name: ["min:4"] });
    expect(validatedData.name).toBe(undefined);
  });
});

describe("Mix of Rules", () => {
  it("should validate multiple fields and rules", () => {
    const validatedData = validate(
      { name: "test", email: "test@test.com" },
      { name: ["required", "min:4"], email: ["required", "email"] }
    );
    expect(validatedData.name).toBe("test");
    expect(validatedData.email).toBe("test@test.com");
  });

  it("should throw multiple errors", () => {
    try {
      validate(
        { name: "tes", email: "test" },
        { name: ["required", "min:4"], email: ["required", "email", "min:10"] }
      );
    } catch (error) {
      expect(error.errors.size).toBe(2);
      expect(error.errors.get("name")[0]).toBe(
        "name must be at least 4 characters long."
      );
      expect(error.errors.get("email")[0]).toBe(
        "email must be a valid email address."
      );
      expect(error.errors.get("email")[1]).toBe(
        "email must be at least 10 characters long."
      );
    }
  });
});
