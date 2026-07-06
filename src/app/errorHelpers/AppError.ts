class AppError extends Error {
  // HTTP status code associated with this error
  public statusCode: number;

  constructor(statusCode: number, message: string, stack = '') {
    // Initialize Error base class with the error message
    super(message);

    // Store the HTTP status code as a property
    this.statusCode = statusCode;

    // Set or auto-capture the stack trace
    if (stack) {
      // Use provided custom stack trace
      this.stack = stack;
    } else {
      // Automatically capture the stack trace at the point where error was thrown
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
