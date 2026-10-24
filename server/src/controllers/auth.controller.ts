import type { Request, Response } from 'express';
import {
  credentialsSchema,
  loginUser,
  registerUser,
} from '../service/auth.service.js';

export async function register(request: Request, response: Response) {
  const credentials = credentialsSchema.parse(request.body);
  const result = await registerUser(credentials);
  response.status(201).json(result);
}

export async function login(request: Request, response: Response) {
  const credentials = credentialsSchema.parse(request.body);
  response.json(await loginUser(credentials));
}
