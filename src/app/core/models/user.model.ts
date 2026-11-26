export type UserRole = 'ADMIN' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  institucion: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name?: string;
  nombre?: string;
  apellido?: string;
  username: string;
  email: string;
  institucion?: string;
  password: string;
  role?: UserRole;
  status?: UserStatus;
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>> & {
  password?: string;
};

export interface StoredUser extends User {
  passwordSalt: string;
  passwordHash: string;
  passwordIterations: number;
}
