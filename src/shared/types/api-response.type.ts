// src/shared/types/api-response.type.ts

export type ApiResponse<T> = {
  message: string;

  data: T;
};
