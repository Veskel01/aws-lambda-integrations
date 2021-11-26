import { plainToInstance, ClassConstructor } from 'class-transformer';

import { validate as validatorValidate } from 'class-validator';
import { ValidationException } from '../CustomErrors/Validation.errors';

const validate = async <T extends Record<any, any>>(
  classToValidate: ClassConstructor<T>,
  request: Record<string | number | symbol, unknown>,
): Promise<void> => {
  const instance = plainToInstance(classToValidate, request);

  const result = await validatorValidate(instance, {
    stopAtFirstError: true,
  });

  if (result.length > 0) {
    throw new ValidationException();
  }
};

export default validate;
