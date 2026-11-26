import { User } from '../../models/user.model';

export abstract class AuthRepository {
  abstract restoreSession(): Promise<User | null>;
  abstract login(identifier: string, password: string): Promise<User>;
  abstract logout(): void;
}
