import { ApiError } from '../utils/ApiError.js';
export const validate = (schema, source = 'query') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const fields = Object.fromEntries(
      Object.entries(result.error.flatten().fieldErrors).map(([field, messages]) => [field, messages[0]])
    );
    return next(new ApiError(400, 'VALIDATION', 'Please check the highlighted fields', fields));
  }
  req[source] = result.data;
  next();
};
