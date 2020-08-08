import { ErrorReturn } from '../types/express';

export const resError: {
  [k: number]: ErrorReturn;
} = {
  400: {
    status: 400,
    code: 'invalid_request',
    text: 'Invalid request',
  },
  403: {
    status: 403,
    code: 'no_permission',
    text: "You don't have permission to access",
  },
  404: {
    status: 404,
    code: 'not_found',
    text: 'Resource not found',
  },
  500: {
    status: 500,
    code: 'error',
    text: 'An error occured',
  },
};

export const returnError = (
  status: number,
  text?: string,
  code?: string
): ErrorReturn => ({
  status,
  code: code || resError[status].code,
  text: text || resError[status].text,
});
