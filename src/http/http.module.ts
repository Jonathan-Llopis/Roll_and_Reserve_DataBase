import { DynamicModule, Module, Provider } from '@nestjs/common';
import { HttpService, CustomAxiosRequestConfig } from './http.service';

@Module({})
export class HttpModule {
  /**
   * @description
   * Creates a dynamic module with the given http service with the given config.
   * @param {Object} option
   * @param {string} option.serviceName
   * @param {CustomAxiosRequestConfig} option.config
   * @returns {DynamicModule}
   */
  private static getDynamicHttpModule(option: {
    serviceName: string;
    config: CustomAxiosRequestConfig;
  }) {
    const httpService = new HttpService(option.config);
    const providerName = option.serviceName;
    return {
      module: HttpModule,
      providers: [
        {
          provide: providerName,
          useValue: httpService,
        },
      ],
      exports: [providerName],
    };
  }

  /**
   * Creates a dynamic module with the given http service with the given config.
   * This method accepts either a single object or an array of objects.
   * If an array is given, it will create a provider for each object in the array.
   * @param {Object | Object[]} options
   * @param {string} options.serviceName
   * @param {CustomAxiosRequestConfig} options.config
   * @returns {DynamicModule}
   */
  static forFeature(
    options:
      | { serviceName: string; config: CustomAxiosRequestConfig }
      | { serviceName: string; config: CustomAxiosRequestConfig }[],
  ): DynamicModule {
    if (Array.isArray(options)) {
      return options.reduce(
        (acc, option) => {
          const httpService = new HttpService(option.config);
          const providerName = option.serviceName;
          acc.providers.push({
            provide: providerName,
            useValue: httpService,
          });
          acc.exports.push(providerName);
          return acc;
        },
        {
          module: HttpModule,
          providers: [],
          exports: [],
        },
      );
    } else {
      return HttpModule.getDynamicHttpModule(options);
    }
  }

  /**
   * Configures the HttpModule for the root module of the application.
   * This method sets up the HttpService with the specified Axios configuration.
   * 
   * Input Parameters:
   * - `config` (CustomAxiosRequestConfig, required): Configuration options for Axios instance.
   * 
   * Example Request (JSON format):
   * {
   *   "baseURL": "https://api.example.com",
   *   "timeout": 5000
   * }
   * 
   * HTTP Responses:
   * - `200 OK`: Successfully sets up the HttpService with the provided configuration.
   * - `4XX/5XX`: Fails to configure the HttpService due to invalid configuration.
   */

  static forRoot(config: CustomAxiosRequestConfig): DynamicModule {
    const httpService = new HttpService(config);

    return {
      module: HttpModule,
      providers: [
        {
          provide: HttpService,
          useValue: httpService,
        },
      ],
      exports: [HttpService],
    };
  }

  /**
   * @description
   * Configures the HttpModule for a feature module of the application.
   * This method sets up the HttpService with the specified Axios configuration.
   * 
   * Input Parameters:
   * - `options` (object, required): Configuration options.
   *   - `serviceName` (string, required): Name to assign to the HttpService provider.
   *   - `config` (CustomAxiosRequestConfig, required): Configuration options for Axios instance.
   * 
   * Example Request (JSON format):
   * {
   *   "serviceName": "MyHttpService",
   *   "config": {
   *     "baseURL": "https://api.example.com",
   *     "timeout": 5000
   *   }
   * }
   * 
   * HTTP Responses:
   * - `200 OK`: Successfully sets up the HttpService with the provided configuration.
   * - `4XX/5XX`: Fails to configure the HttpService due to invalid configuration.
   */
  static forFeatureWithProvider(options: {
    serviceName: string;
    config: CustomAxiosRequestConfig;
  }): {
    module: DynamicModule;
    provider: Provider;
  } {
    const httpService = new HttpService(options.config);
    const providerName = options.serviceName;
    const provider = {
      provide: providerName,
      useValue: httpService,
    } as Provider;
    return {
      module: {
        module: HttpModule,
        providers: [provider],
        exports: [providerName, HttpModule],
      },
      provider,
    };
  }
}
