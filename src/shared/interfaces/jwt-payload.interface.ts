// src/shared/interfaces/jwt-payload.interface.ts

import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
