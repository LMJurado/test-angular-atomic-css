import { CreateUserInput, StoredUser, UpdateUserInput, User, UserRole, UserStatus } from '../../models/user.model';

export abstract class UserRepository {
  abstract initialize(): Promise<void>;
  abstract getAll(): Promise<User[]>;
  abstract getById(id: string): Promise<User | null>;
  abstract getByUsernameOrEmail(identifier: string): Promise<User | null>;
  abstract verifyCredentials(identifier: string, password: string): Promise<User | null>;
  abstract create(input: CreateUserInput): Promise<User>;
  abstract update(id: string, input: UpdateUserInput): Promise<User>;
  abstract setRole(id: string, role: UserRole): Promise<User>;
  abstract setStatus(id: string, status: UserStatus): Promise<User>;
  abstract updatePassword(username: string, password: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract countAdmins(): Promise<number>;
}

export type { StoredUser };
