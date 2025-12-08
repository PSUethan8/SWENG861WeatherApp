import { createError } from '../../middleware/errorHandler.js';

describe('Error Handler', () => {
  describe('createError', () => {
    it('should create an error with message and status code', () => {
      const error = createError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should create a 404 error', () => {
      const error = createError('Not found', 404);

      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
    });

    it('should create a 500 error', () => {
      const error = createError('Internal error', 500);

      expect(error.message).toBe('Internal error');
      expect(error.statusCode).toBe(500);
    });
  });
});

