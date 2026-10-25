export type OfficialCredentials = {
  username: string;
  password: string;
};

export type OfficialUser = {
  id: string;
  username: string;
};

type AuthResponse = {
  accessToken: string;
  user: OfficialUser;
};

const requestTimeoutMs = 15_000;

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'AuthApiError';
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function request<T>(
  path: string,
  options: {
    method: 'GET' | 'POST';
    token?: string;
    body?: OfficialCredentials;
  },
): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: options.method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token
          ? { Authorization: `Bearer ${options.token}` }
          : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch (error: unknown) {
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
  }

  const responseBody: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      isRecord(responseBody) && typeof responseBody.error === 'string'
        ? responseBody.error
        : 'Não foi possível concluir a autenticação.';

    throw new AuthApiError(message, response.status);
  }

  return responseBody as T;
}

function isOfficialUser(value: unknown): value is OfficialUser {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.username === 'string'
  );
}

function parseAuthResponse(response: AuthResponse): AuthResponse {
  if (
    typeof response?.accessToken !== 'string' ||
    !isOfficialUser(response.user)
  ) {
    throw new Error('O servidor retornou uma resposta de autenticação inválida.');
  }

  return response;
}

export async function registerOfficialAccount(
  credentials: OfficialCredentials,
): Promise<AuthResponse> {
  const response = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: credentials,
  });

  return parseAuthResponse(response);
}

export async function loginOfficialAccount(
  credentials: OfficialCredentials,
): Promise<AuthResponse> {
  const response = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  });

  return parseAuthResponse(response);
}

export async function getOfficialAccount(token: string): Promise<OfficialUser> {
  const response = await request<{ data?: unknown }>('/users/me', {
    method: 'GET',
    token,
  });

  if (!isRecord(response) || !isOfficialUser(response.data)) {
    throw new Error('O servidor retornou dados de conta inválidos.');
  }

  return response.data;
}
