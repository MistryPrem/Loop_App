import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export function validate(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map(i => ({
          field: i.path.slice(1).join('.'),
          message: i.message
        }));
        const readableMessage = issues[0]?.message || 'Please check your submitted details.';
        return next(new AppError(readableMessage, 400, 'VALIDATION_ERROR', issues));
      }
      next(error);
    }
  };
}
