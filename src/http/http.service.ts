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

  /**
   * Constructs an instance of HttpService.
   *
   * Configures the Axios instance used by this service.
   * If `enableLogging` is true, sets up interceptors for logging.
   * @param {CustomAxiosRequestConfig} options
   * - `enableLogging` (boolean, optional): Whether or not to log HTTP requests and responses.
   * - `...` ( AxiosRequestConfig ): Other configuration options for Axios instance.
   */
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

  /**
   * Intercepts and logs outgoing HTTP requests.
   * @param {InternalAxiosRequestConfig} config - The outgoing HTTP request configuration.
   * @returns {InternalAxiosRequestConfig} The outgoing HTTP request configuration.
   * @description
   * This method intercepts and logs outgoing HTTP requests.
   * The request is logged with the following format:
   *   HTTP Request: [HTTP VERB] [Route]
   * Example:
   *   HTTP Request: GET https://example.com/users
   */
  private handleRequest(
    config: InternalAxiosRequestConfig,
  ): InternalAxiosRequestConfig {
    console.info(
      `HTTP Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    return config;
  }

  /**
   * Intercepts and logs incoming HTTP responses.
   * @param {AxiosResponse} response - The incoming HTTP response.
   * @returns {AxiosResponse} The incoming HTTP response.
   * @description
   * This method intercepts and logs incoming HTTP responses.
   * The response is logged with the following format:
   *   HTTP Response: [HTTP STATUS CODE] [HTTP VERB] [Route]
   * Example:
   *   HTTP Response: 200 GET https://example.com/users
   */
  private handleResponse(response: AxiosResponse): AxiosResponse {
    console.info(
      `HTTP Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.baseURL}${
        response.config.url
      }`,
    );
    return response;
  }

  /**
   * Intercepts and logs incoming HTTP errors.
   * @param {AxiosError} error - The incoming HTTP error.
   * @returns {Promise<AxiosError>} The incoming HTTP error.
   * @description
   * This method intercepts and logs incoming HTTP errors.
   * The error is logged with the following format:
   *   HTTP Error: [Axios error message]
   * Example:
   *   HTTP Error: Request failed with status code 404
   */
  private handleErrorResponse(error: AxiosError): Promise<AxiosError> {
    console.error(`HTTP Error: ${error.message}`, { error });
    return Promise.reject(error);
  }

  /**
   * Makes a GET request to the specified URL.
   * @param {string} url - The URL of the request.
   * @param {AxiosRequestConfig} [config] - The configuration of the request.
   * @returns {Promise<AxiosResponse<T>>} The response of the request.
   * @description
   * Makes a GET request to the specified URL and returns the response.
   * The response is logged with the following format:
   *   HTTP Response: [HTTP STATUS CODE] GET [Route]
   * Example:
   *   HTTP Response: 200 GET https://example.com/users
   * HTTP Responses:
   * - `200 OK`: The request was successful.
   * - `4XX/5XX`: The request failed.
   */
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

  /**
   * Makes a POST request to the specified URL.
   * @param {string} url - The URL of the request.
   * @param {any} data - The data to be sent as the request body.
   * @param {AxiosRequestConfig} [config] - The configuration of the request.
   * @returns {Promise<AxiosResponse<T>>} The response of the request.
   * @description
   * Makes a POST request to the specified URL and returns the response.
   * The response is logged with the following format:
   *   HTTP Response: [HTTP STATUS CODE] POST [Route]
   * Example:
   *   HTTP Response: 200 POST https://example.com/users
   * HTTP Responses:
   * - `200 OK`: The request was successful.
   * - `4XX/5XX`: The request failed.
   */
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

  /**
   * Makes a PUT request to the specified URL.
   * @param {string} url - The URL of the request.
   * @param {any} data - The data to be sent as the request body.
   * @param {AxiosRequestConfig} [config] - The configuration of the request.
   * @returns {Promise<AxiosResponse<T>>} The response of the request.
   * @description
   * Makes a PUT request to the specified URL and returns the response.
   * The response is logged with the following format:
   *   HTTP Response: [HTTP STATUS CODE] PUT [Route]
   * Example:
   *   HTTP Response: 200 PUT https://example.com/users
   * HTTP Responses:
   * - `200 OK`: The request was successful.
   * - `4XX/5XX`: The request failed.
   */
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

  /**
   * Makes a PATCH request to the specified URL.
   * @param {string} url - The URL of the request.
   * @param {any} data - The data to be sent as the request body.
   * @param {AxiosRequestConfig} [config] - The configuration of the request.
   * @returns {Promise<AxiosResponse<T>>} The response of the request.
   * @description
   * Makes a PATCH request to the specified URL and returns the response.
   * The response is logged with the following format:
   *   HTTP Response: [HTTP STATUS CODE] PATCH [Route]
   * Example:
   *   HTTP Response: 200 PATCH https://example.com/users
   * HTTP Responses:
   * - `200 OK`: The request was successful.
   * - `4XX/5XX`: The request failed.
   */
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

  /**
   * Makes a DELETE request to the specified URL.
   * @param {string} url - The URL of the request.
   * @param {AxiosRequestConfig} [config] - The configuration of the request.
   * @returns {Promise<AxiosResponse<T>>} The response of the request.
   * @description
   * Makes a DELETE request to the specified URL and returns the response.
   * The response is logged with the following format:
   *   HTTP Response: [HTTP STATUS CODE] DELETE [Route]
   * Example:
   *   HTTP Response: 200 DELETE https://example.com/users
   * HTTP Responses:
   * - `200 OK`: The request was successful.
   * - `4XX/5XX`: The request failed.
   */
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
