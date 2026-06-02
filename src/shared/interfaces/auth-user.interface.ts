// src/shared/interfaces/auth-user.interface.ts

import { Role } from '../enums/role.enum';

export interface AuthUser {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}
