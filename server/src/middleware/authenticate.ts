import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../lib/api-error.js';
import { verifyAccessToken } from '../lib/jwt.js';
import { UserModel } from '../models/user.model.js';

declare global {
  namespace Express {
    interface Request {
      authenticatedUserId?: string;
    }
  }
}

export async function authenticate(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  const authorization = request.header('authorization');
  const bearerToken = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

  if (!bearerToken) {
    next(new ApiError(401, 'A bearer access token is required.'));
    return;
  }

  try {
    const { userId } = await verifyAccessToken(bearerToken);
    const userExists = await UserModel.exists({ _id: userId });
    if (!userExists) throw new ApiError(401, 'User account was not found.');

    request.authenticatedUserId = userId;
    next();
  } catch (error) {
    next(error);
  }
}
