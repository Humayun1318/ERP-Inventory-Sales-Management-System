import z from 'zod';

// ---------------------------------------------------------------------------
// MongoDB ID Schema
// ---------------------------------------------------------------------------
export const mongoIdSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? 'ID is required' : 'ID must be a string',
  })
  .regex(/^[a-f\d]{24}$/i, {
    message: 'Invalid MongoDB ObjectId',
  });
