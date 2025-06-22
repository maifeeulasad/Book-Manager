import * as validator from "validator";
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export class BookValidator {
  static isIsbn(value: string): boolean {
    return validator.isISBN(value, 10) || validator.isISBN(value, 13);
  }
}

export function IsIsbnValidate() {
  return {
    validator: BookValidator.isIsbn,
    message: (props: { value: string }) =>
      `"${props.value}" is not a valid ISBN-10 or ISBN-13`,
  };
}

export function IsValidISBN(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: "isIsbnCustom",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return typeof value === "string" && BookValidator.isIsbn(value);
        },
        defaultMessage(_args: ValidationArguments) {
          return `${propertyName} is not a valid ISBN-10 or ISBN-13`;
        },
      },
    });
  };
}
