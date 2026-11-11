import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should format HttpException correctly', () => {
    const statusResponse = jest.fn().mockReturnThis();
    const jsonResponse = jest.fn();

    const mockResponse = {
      status: statusResponse,
      json: jsonResponse,
    };

    const mockRequest = {
      url: '/test-endpoint',
      method: 'GET',
    };

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;

    const exception = new HttpException('Resource not found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(statusResponse).toHaveBeenCalledWith(404);
    expect(jsonResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        path: '/test-endpoint',
        message: 'Resource not found',
      }),
    );
  });

  it('should handle unhandled Error with 500 status', () => {
    const statusResponse = jest.fn().mockReturnThis();
    const jsonResponse = jest.fn();

    const mockResponse = {
      status: statusResponse,
      json: jsonResponse,
    };

    const mockRequest = {
      url: '/crash',
      method: 'POST',
    };

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;

    const error = new Error('Database connection failed');

    filter.catch(error, mockHost);

    expect(statusResponse).toHaveBeenCalledWith(500);
    expect(jsonResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        path: '/crash',
        message: 'Internal server error',
      }),
    );
  });
});
