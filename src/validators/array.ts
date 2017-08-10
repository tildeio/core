import { Task } from 'no-show';
import { ValidationDescriptor, ValidationDescriptors, ValidationBuilderDSL, validates, multi } from '@validations/dsl';
import { Validator, ValidationError, NoArgs } from '../validator';
import { SingleFieldValidator, SingleFieldError } from './single-field';
import { validate } from '../validate';
import { Opaque, flatten, dict } from '../utils';

export class ArrayValidator extends SingleFieldValidator<NoArgs> {
  protected normalized: ValidationDescriptor[];

  validate(value: Opaque, error: SingleFieldError): void {
    // ignore null and undefined, which should be handled by the presence validator
    if (Array.isArray(value) || value === null || value === undefined) return;

    error.set('array');
  }
}

export class MembersValidator extends Validator<[ValidationBuilderDSL]> {
  protected normalized: ValidationDescriptors;

  run(): Task<ValidationError[]> {
    let { value, arg, env, field } = this;

    return new Task(async run => {
      if (!Array.isArray(value)) {
        return [];
      }

      let errors: ValidationError[] = [];

      let validators: ValidationDescriptors = dict<ValidationDescriptor[]>();

      for (let index = 0; index < value.length; index++) {
        validators[index] = [...flatten(arg.build(String(index)))] as any;
      }

      let suberrors = await run(validate(env, value, validators));

      for (let error of suberrors) {
        errors.push({ message: error.message, path: [field, ...error.path] });
      }

      return errors;
    });
  }
}

export function array(dsl: ValidationBuilderDSL): ValidationBuilderDSL {
  return multi().add(validates('array')).add(validates('members', dsl));
}
