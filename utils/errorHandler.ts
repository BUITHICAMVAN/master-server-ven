import { NextApiResponse } from 'next';

// Define the shape of an error
interface ApiError {
  statusCode: number;
  message: string;
  details?: any;  // Optional: Include any additional details (e.g., validation issues)
}

// Function to send the error response in a consistent format
export const errorHandler = (res: NextApiResponse, error: ApiError | any) => {
  // Log the error details for server-side debugging
  console.error("Error occurred:", error.message || error);

  // Default to 500 Internal Server Error if the statusCode is not set
  const statusCode = error.statusCode || 500;

  // Standard response body with error details
  const errorResponse = {
    error: error.message || 'Internal Server Error',
    details: error.details || 'No additional details', // Additional error information if provided
    statusCode: statusCode
  };

  // Send the response with the appropriate HTTP status code
  return res.status(statusCode).json(errorResponse);
};

// Utility function to create different types of errors

// 400 Bad Request
export const createBadRequestError = (message: string, details?: any) => ({
  statusCode: 400,
  message: message || 'Bad Request',
  details: details || 'Invalid request parameters or missing data'
});

// 401 Unauthorized
export const createUnauthorizedError = (message: string, details?: any) => ({
  statusCode: 401,
  message: message || 'Unauthorized',
  details: details || 'Authentication failed'
});

// 403 Forbidden
export const createForbiddenError = (message: string, details?: any) => ({
  statusCode: 403,
  message: message || 'Forbidden',
  details: details || 'You do not have permission to access this resource'
});

// 404 Not Found
export const createNotFoundError = (message: string, details?: any) => ({
  statusCode: 404,
  message: message || 'Not Found',
  details: details || 'The requested resource could not be found'
});

// 500 Internal Server Error (default if none specified)
export const createInternalServerError = (message: string, details?: any) => ({
  statusCode: 500,
  message: message || 'Internal Server Error',
  details: details || 'An unexpected error occurred'
});
