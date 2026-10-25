import {
  apiRequest,
  ApiClientError,
} from '@/src/data/apiClient';

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

function isOfficialUser(value: unknown): value is OfficialUser {
  if (typeof value !== 'object' || value === null) return false;

  const user = value as Partial<OfficialUser>;
  return typeof user.id === 'string' && typeof user.username === 'string';
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
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    jsonBody: credentials,
  });

  return parseAuthResponse(response);
}

export async function loginOfficialAccount(
  credentials: OfficialCredentials,
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    jsonBody: credentials,
  });

  return parseAuthResponse(response);
}

export async function getOfficialAccount(token: string): Promise<OfficialUser> {
  const response = await apiRequest<{ data?: unknown }>('/users/me', { token });
  if (!isOfficialUser(response?.data)) {
    throw new Error('O servidor retornou dados de conta inválidos.');
  }

  return response.data;
}

export { ApiClientError };
