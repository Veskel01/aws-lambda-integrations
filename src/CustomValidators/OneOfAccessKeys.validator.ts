import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// types
import { AccessKeysType } from '../UserAccess/UserAccess.types';

const keys: AccessKeysType[] = [
  'full_access',
  'mentors',
  'questionnaires',
  'roadmaps',
  'students',
  'summary',
];

@ValidatorConstraint({ async: true })
export class OneOfConstraint implements ValidatorConstraintInterface {
  validate(args: any, options: ValidationArguments) {
    return Array.isArray(args)
      ? args.every((item) => keys.includes(item))
      : false;
  }
}

export function OneOfAccessKey(validationOptions?: ValidationOptions) {
  return function (object: Record<any, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: OneOfConstraint,
    });
  };
}
