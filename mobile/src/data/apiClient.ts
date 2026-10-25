import { File, UploadType } from 'expo-file-system';

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string;
  jsonBody?: unknown;
  responseType?: 'json' | 'text' | 'arrayBuffer';
  signal?: AbortSignal;
};

const requestTimeoutMs = 15_000;
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function getApiBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    throw new Error(
      'Configure EXPO_PUBLIC_API_URL para conectar ao AniKeeper API.',
    );
  }

  return configuredUrl.replace(/\/+$/, '');
}

function getErrorMessage(responseBody: unknown): string | null {
  if (typeof responseBody === 'string' && responseBody.trim()) {
    return responseBody;
  }

  if (typeof responseBody !== 'object' || responseBody === null) return null;

  const responseRecord = responseBody as Record<string, unknown>;
  if (typeof responseRecord.error === 'string') return responseRecord.error;
  if (typeof responseRecord.message === 'string') return responseRecord.message;

  return null;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  const abortRequest = () => controller.abort();
  options.signal?.addEventListener('abort', abortRequest, { once: true });

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: options.method ?? 'GET',
      signal: controller.signal,
      headers: {
        Accept: options.responseType === 'text' ? 'text/plain' : 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.jsonBody !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      ...(options.jsonBody !== undefined
        ? { body: JSON.stringify(options.jsonBody) }
        : {}),
    });

    if (response.status === 204) return undefined as T;

    const responseBody: unknown =
      options.responseType === 'arrayBuffer'
        ? await response.arrayBuffer()
        : options.responseType === 'text'
          ? await response.text()
          : await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && options.token) unauthorizedHandler?.();
      throw new ApiClientError(
        getErrorMessage(responseBody) ?? 'Não foi possível concluir a solicitação.',
        response.status,
      );
    }

    return responseBody as T;
  } catch (error: unknown) {
    if (error instanceof ApiClientError) throw error;
    if (controller.signal.aborted) {
      throw new Error('O servidor demorou para responder. Tente novamente.');
    }
    if (error instanceof Error && error.name === 'TypeError') {
      throw new Error(
        'Não foi possível conectar ao servidor. Verifique a URL da API e sua conexão.',
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abortRequest);
  }
}

export async function apiUploadFile(
  path: string,
  options: {
    token: string;
    fileUri: string;
    fieldName: string;
    mimeType: string;
  },
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const file = new File(options.fileUri);
    const response = await file.upload(`${getApiBaseUrl()}${path}`, {
      httpMethod: 'PUT',
      uploadType: UploadType.MULTIPART,
      fieldName: options.fieldName,
      mimeType: options.mimeType,
      headers: { Authorization: `Bearer ${options.token}` },
      signal: controller.signal,
    });

    if (response.status === 401) unauthorizedHandler?.();
    if (response.status < 200 || response.status >= 300) {
      let responseBody: unknown;
      try {
        responseBody = JSON.parse(response.body);
      } catch {
        responseBody = response.body;
      }

      throw new ApiClientError(
        getErrorMessage(responseBody) ?? 'Não foi possível enviar o arquivo.',
        response.status,
      );
    }
  } catch (error: unknown) {
    if (error instanceof ApiClientError) throw error;
    if (controller.signal.aborted) {
      throw new Error('O envio demorou para responder. Tente novamente.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
