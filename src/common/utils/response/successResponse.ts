import { Response } from 'express';
export const successfulResponse = (
  message: string,
  statusCode: number = 200,
  data?: any,
) => {
  return {
    statusCode,
    message,
    ...data,
  };
};
