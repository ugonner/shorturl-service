import { HttpStatus } from '@nestjs/common';

class ApiResponse<ResourceType> {
  public message: string;
  public status: boolean;
  public statusCode: number;
  public data: ResourceType;
  public error: Error;

  constructor(
    message: string,
    status: boolean,
    statusCode: number,
    data?: ResourceType,
    error?: Error,
  ) {
    this.message = message;
    this.status = status;
    this.statusCode = statusCode;
    this.data = data;
    this.error = error;
  }

  public static success<ResourceType>(
    message: string,
    statusCode: number = HttpStatus.OK,
    data?: ResourceType,
  ): IGenericResponse<ResourceType> {
    return new ApiResponse(message, true, statusCode, data);
  }

  public static fail<ResourceType>(
    message: string,
    statusCode: number = HttpStatus.NOT_FOUND,
    error?: any,
  ): IGenericResponse<ResourceType> {
    return new ApiResponse(message, false, statusCode, null, error);
  }
}

export { ApiResponse };

export interface IGenericResponse<ResourceType> {
  statusCode: number;
  status?: boolean;
  message: string;
  data?: ResourceType;
  error?: any;
}
