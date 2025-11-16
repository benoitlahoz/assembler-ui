import type { CheckInPlugin } from '../types';

export interface ValidationOptions<T = any> {
  /** List of required fields */
  required?: (keyof T)[];

  /** Custom validation function. Return true for valid, false or error message for invalid */
  validate?: (data: T) => boolean | string;
}

/**
 * Plugin to validate data before check-in.
 * Validates required fields and runs custom validation logic.
 *
 * @example
 * ```ts
 * const { desk } = createDesk('handlers', {
 *   plugins: [
 *     createValidationPlugin({
 *       required: ['name', 'email'],
 *       validate: (data) => {
 *         if (!data.email.includes('@')) {
 *           return 'Invalid email format';
 *         }
 *         return true;
 *       }
 *     })
 *   ]
 * });
 * ```
 */
export const createValidationPlugin = <T = any>(
  options: ValidationOptions<T>
): CheckInPlugin<T> => ({
  name: 'validation',
  version: '1.0.0',

  onBeforeCheckIn: (id, data) => {
    // Check required fields
    if (options.required) {
      for (const field of options.required) {
        if (data[field] === undefined || data[field] === null) {
          console.error(`[Validation Plugin] Field '${String(field)}' is required for item ${id}`);
          return false;
        }
      }
    }

    // Custom validation
    if (options.validate) {
      const result = options.validate(data);
      if (result === false) {
        console.error(`[Validation Plugin] Validation failed for item ${id}`);
        return false;
      }
      if (typeof result === 'string') {
        console.error(`[Validation Plugin] ${result}`);
        return false;
      }
    }

    return true;
  },
});
