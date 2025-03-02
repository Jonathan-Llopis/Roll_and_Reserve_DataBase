import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Injectable } from '@nestjs/common';

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  enableLogging?: boolean;
}

@Injectable()
export class HttpService {
  private axiosInstance: AxiosInstance;

  constructor(private readonly options: CustomAxiosRequestConfig) {
    const { enableLogging, ...config } = options;
    this.axiosInstance = axios.create(config);
    if (enableLogging) {
      this.axiosInstance.interceptors.request.use(this.handleRequest);
      this.axiosInstance.interceptors.response.use(
        this.handleResponse,
        this.handleErrorResponse,
      );
    }
  }

  private handleRequest(
    config: InternalAxiosRequestConfig,
  ): InternalAxiosRequestConfig {
    console.info(
      `HTTP Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    return config;
  }

  private handleResponse(response: AxiosResponse): AxiosResponse {
    console.info(
      `HTTP Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.baseURL}${
        response.config.url
      }`,
    );
    return response;
  }

  private handleErrorResponse(error: AxiosError): Promise<AxiosError> {
    console.error(`HTTP Error: ${error.message}`, { error });
    return Promise.reject(error);
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(
      url,
      config,
    );
    return response;
  }

  async post<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(
      url,
      data,
      config,
    );
    return response;
  }

  async put<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(
      url,
      data,
      config,
    );
    return response;
  }

  async patch<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(
      url,
      data,
      config,
    );
    return response;
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(
      url,
      config,
    );
    return response;
  }
}
