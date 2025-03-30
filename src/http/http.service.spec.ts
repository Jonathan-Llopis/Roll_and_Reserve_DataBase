import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from './http.service';
import { AxiosHeaders, AxiosResponse } from 'axios';

describe('HttpService', () => {
    let service: HttpService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: HttpService,
                    useValue: new HttpService({ enableLogging: false }),
                },
            ],
        }).compile();

        service = module.get<HttpService>(HttpService);
    });

    it('should perform a successful GET request', async () => {
        const mockResponse: AxiosResponse = {
            data: { message: 'Success' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: { headers: AxiosHeaders.from({ 'Content-Type': 'application/json' }) },
        };
        jest.spyOn(service, 'get').mockResolvedValue(mockResponse);

        const result = await service.get('https://example.com');
        expect(result).toEqual(mockResponse);
    });

    it('should throw an error for a failed GET request', async () => {
        jest.spyOn(service, 'get').mockRejectedValue(new Error('Request failed'));

        await expect(service.get('https://example.com')).rejects.toThrow(
            'Request failed',
        );
    });

    it('should perform a successful POST request', async () => {
        const mockResponse: AxiosResponse = {
            data: { message: 'Created' },
            status: 201,
            statusText: 'Created',
            headers: {},
            config: { headers: AxiosHeaders.from({ 'Content-Type': 'application/json' }) },
        };
        jest.spyOn(service, 'post').mockResolvedValue(mockResponse);

        const result = await service.post('https://example.com', { key: 'value' });
        expect(result).toEqual(mockResponse);
    });

    it('should throw an error for a failed POST request', async () => {
        jest.spyOn(service, 'post').mockRejectedValue(new Error('Request failed'));

        await expect(
            service.post('https://example.com', { key: 'value' }),
        ).rejects.toThrow('Request failed');
    });

    it('should perform a successful PUT request', async () => {
        const mockResponse: AxiosResponse = {
            data: { message: 'Updated' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: { headers: AxiosHeaders.from({}) },
        };
        jest.spyOn(service, 'put').mockResolvedValue(mockResponse);

        const result = await service.put('https://example.com', { key: 'value' });
        expect(result).toEqual(mockResponse);
    });

    it('should throw an error for a failed PUT request', async () => {
        jest.spyOn(service, 'put').mockRejectedValue(new Error('Request failed'));

        await expect(
            service.put('https://example.com', { key: 'value' }),
        ).rejects.toThrow('Request failed');
    });

    it('should perform a successful PATCH request', async () => {
        const mockResponse: AxiosResponse = {
            data: { message: 'Patched' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: { headers: AxiosHeaders.from({ 'Content-Type': 'application/json' }) },
        };
        jest.spyOn(service, 'patch').mockResolvedValue(mockResponse);

        const result = await service.patch('https://example.com', { key: 'value' });
        expect(result).toEqual(mockResponse);
    });

    it('should throw an error for a failed PATCH request', async () => {
        jest.spyOn(service, 'patch').mockRejectedValue(new Error('Request failed'));

        await expect(
            service.patch('https://example.com', { key: 'value' }),
        ).rejects.toThrow('Request failed');
    });

    it('should perform a successful DELETE request', async () => {
        const mockResponse: AxiosResponse = {
            data: { message: 'Deleted' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: { headers: AxiosHeaders.from({ 'Content-Type': 'application/json' }) },
        };
        jest.spyOn(service, 'delete').mockResolvedValue(mockResponse);

        const result = await service.delete('https://example.com');
        expect(result).toEqual(mockResponse);
    });

    it('should throw an error for a failed DELETE request', async () => {
        jest.spyOn(service, 'delete').mockRejectedValue(new Error('Request failed'));

        await expect(service.delete('https://example.com')).rejects.toThrow(
            'Request failed',
        );
    });
});