// src/api/schemas/authSchemas.ts
import type { ApiResponse } from './apiResponse';

export interface Token {
  accessToken: string;
  refreshToken: string;
}

export type ApiResponseWithDataNull = ApiResponse<null>;
