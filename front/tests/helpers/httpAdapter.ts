import { AxiosError } from 'axios';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

type Reply = { status?: number; data: unknown; headers?: Record<string, string> };

// Sustituye sólo el transporte: configuración, transformación e interceptores son los de Axios.
export const mockHttpAdapter =
  (respond: (config: InternalAxiosRequestConfig) => Reply | Promise<Reply>): AxiosAdapter =>
  async (config) => {
    const reply = await respond(config);
    const response: AxiosResponse = {
      status: reply.status ?? 200,
      statusText: '',
      data: reply.data,
      headers: reply.headers ?? { 'content-type': 'application/json' },
      config,
    };
    if (response.status >= 400)
      throw new AxiosError('HTTP rechazado', 'ERR_BAD_RESPONSE', config, undefined, response);
    return response;
  };
