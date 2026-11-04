/**
 * Utility functions to extract error and success messages from backend responses.
 * Handles:
 * - Validation errors (ProblemDetails ModelState dictionary: errors: { Field: [...] })
 * - Object message property ({ message: "..." })
 * - Plain-text response strings (or JSON string in plain text)
 * - ProblemDetails title
 * - HTTP status codes: 400, 401, 403, 404, 500, 0
 */
export function extractErrorMessage(err: any, fallbackMessage: string = 'An unexpected error occurred.'): string {
  if (!err) {
    return fallbackMessage;
  }

  // 1. Backend validation errors dictionary (e.g., ProblemDetails ModelState)
  if (err.error?.errors && typeof err.error.errors === 'object') {
    const errorMessages: string[] = [];
    for (const [key, val] of Object.entries(err.error.errors)) {
      if (Array.isArray(val)) {
        errorMessages.push(...val);
      } else if (typeof val === 'string') {
        errorMessages.push(val);
      }
    }
    if (errorMessages.length > 0) {
      return errorMessages.join(' ');
    }
  }

  // 2. Object with message property
  if (err.error?.message && typeof err.error.message === 'string' && err.error.message.trim()) {
    return err.error.message.trim();
  }

  // 3. Plain text response in err.error
  if (typeof err.error === 'string' && err.error.trim()) {
    try {
      const parsed = JSON.parse(err.error);
      if (parsed?.message && typeof parsed.message === 'string') {
        return parsed.message.trim();
      }
      if (parsed?.title && typeof parsed.title === 'string') {
        return parsed.title.trim();
      }
    } catch {
      return err.error.trim();
    }
  }

  // 4. ProblemDetails title
  if (err.error?.title && typeof err.error.title === 'string' && err.error.title.trim()) {
    return err.error.title.trim();
  }

  // 5. HTTP status specific messages
  if (err.status === 404) {
    return 'The requested record was not found.';
  }
  if (err.status === 403) {
    return 'Access denied. You do not have permission to perform this action.';
  }
  if (err.status === 401) {
    return 'You are not authenticated or your session has expired. Please log in.';
  }
  if (err.status === 400) {
    return 'Invalid request data provided.';
  }
  if (err.status === 0) {
    return 'Unable to connect to the server. Please ensure the backend is running.';
  }
  if (err.status >= 500) {
    return 'A server error occurred. Please try again later.';
  }

  return fallbackMessage;
}

export function extractSuccessMessage(res: any, fallbackMessage: string): string {
  if (!res) {
    return fallbackMessage;
  }
  if (typeof res === 'string' && res.trim()) {
    try {
      const parsed = JSON.parse(res);
      if (parsed?.message && typeof parsed.message === 'string') {
        return parsed.message.trim();
      }
    } catch {
      return res.trim();
    }
  }
  if (res.message && typeof res.message === 'string' && res.message.trim()) {
    return res.message.trim();
  }
  return fallbackMessage;
}

