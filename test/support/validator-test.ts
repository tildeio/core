import {
  Environment as AbstractEnvironment,
  Opaque,
  ValidatorClass,
  ValidationError,
  dict,
  validate as validateWithEnv,
  ArrayValidator,
  DateValidator,
  FieldsValidator,
  FormatValidator,
  MembersValidator,
  NumericValidator,
  ObjectValidator,
  PresenceValidator,
  RangeValidator,
  StringValidator
} from '@validations/core';
import { Task } from 'no-show';
import { ValidationDescriptors } from '@validations/dsl';
import { TestCase } from './test-case';

export abstract class ValidationTest extends TestCase {
  protected env = new Environment();

  protected define(): void {
    this.env.register('array', ArrayValidator);
    this.env.register('date', DateValidator);
    this.env.register('fields', FieldsValidator);
    this.env.register('format', FormatValidator);
    this.env.register('members', MembersValidator);
    this.env.register('numeric', NumericValidator);
    this.env.register('object', ObjectValidator);
    this.env.register('presence', PresenceValidator);
    this.env.register('range', RangeValidator);
    this.env.register('string', StringValidator);
  }

  protected validate(object: Opaque, descs: ValidationDescriptors): Task<ValidationError[]> {
    return validateWithEnv(this.env, object, descs);
  }

  before() {
    this.define();
  }
}

/**
 * Define the test environment:
 *
 * - get() has the default definition (JavaScript lookup)
 * - tests can register validator names with register()
 */

export class Environment extends AbstractEnvironment {
  private validators = dict<ValidatorClass>();

  register(name: string, constructor: ValidatorClass) {
    this.validators[name] = constructor;
  }

  getValidator(name: string): ValidatorClass {
    return this.validators[name];
  }
}

export interface ValidatorDecorator {
  (name: string): (constructor: ValidatorClass) => void;
}
