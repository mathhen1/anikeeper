import { SignJWT, jwtVerify } from 'jose';
import { ApiError } from './api-error.js';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new ApiError(
      500,
      'JWT_SECRET must be configured with at least 32 characters.',
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createAccessToken(userId: string): Promise<string> {
  return new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<{ userId: string }> {
  const secret = getJwtSecret();

  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) throw new Error('Token subject is missing.');

    return { userId: payload.sub };
  } catch {
    throw new ApiError(401, 'Invalid or expired access token.');
  }
}
