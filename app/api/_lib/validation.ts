export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readString(
  value: unknown,
  field: string,
  options: { required?: boolean; maxLength?: number } = {},
): ValidationResult<string | undefined> {
  const { required = false, maxLength = 200 } = options;

  if (value === undefined || value === null || value === '') {
    return required
      ? { success: false, error: `${field} is required` }
      : { success: true, data: undefined };
  }

  if (typeof value !== 'string') {
    return { success: false, error: `${field} must be a string` };
  }

  const result = value.trim();
  if (result.length > maxLength) {
    return { success: false, error: `${field} must not exceed ${maxLength} characters` };
  }

  return { success: true, data: result };
}

export function validationError(message: string, status = 400) {
  return Response.json(
    { success: false, error: { code: 'VALIDATION_ERROR', message } },
    { status },
  );
}
