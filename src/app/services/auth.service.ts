import { HttpClient } from '@angular/common/http';
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { tap, catchError, delay } from 'rxjs/operators';

interface User {
  nombre: string;
  apellido: string;
  email: string;
  username: string;
}

@Injectable()
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private readonly demoUsername = '123456';
  private _user: User | null = null;
  private useMockData = true; // Usar datos locales cuando el backend no esté disponible
  private registeredUsers: any[] = [];

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('user');
    if (stored) this._user = JSON.parse(stored);
    
    // Cargar usuarios registrados del localStorage
    const usersStore = localStorage.getItem('registeredUsers');
    if (usersStore) {
      this.registeredUsers = JSON.parse(usersStore);
    }

    this.ensureDemoUser();
  }

  get user(): User | null {
    return this._user;
  }

  isLoggedIn(): boolean {
    return !!this._user;
  }

  currentUserName(): string {
    return this._user ? this._user.nombre : '';
  }

  currentUserInitials(): string {
    if (!this._user) return '?';
    return this._user.nombre.charAt(0).toUpperCase();
  }

  login(usernameOrEmail: string, password: string) {
    // Intentar con el backend primero
    return this.http.post<User>(`${this.apiUrl}/auth/login`, {
      usernameOrEmail, password
    }).pipe(
      tap(user => {
        this.persistAuthenticatedUser(user);
      }),
      catchError(error => {
        // Si el backend falla, intentar con datos locales
        return this.loginLocal(usernameOrEmail, password);
      })
    );
  }

  register(payload: any) {
    // Intentar con el backend primero
    return this.http.post<User>(`${this.apiUrl}/auth/register`, payload)
      .pipe(
        tap(user => {
          this._user = user;
          localStorage.setItem('user', JSON.stringify(user));
          this.saveUserLocally(payload);
        }),
        catchError(error => {
          // Si el backend falla, registrar localmente
          return this.registerLocal(payload);
        })
      );
  }

  logout() {
    this._user = null;
    localStorage.removeItem('user');
  }

  // Verificar si un usuario existe por username
  userExists(username: string): boolean {
    const usersStore = localStorage.getItem('registeredUsers');
    if (!usersStore) return false;
    
    try {
      const users = JSON.parse(usersStore);
      return users.some((u: any) => u.username === username);
    } catch {
      return false;
    }
  }

  // Actualizar contraseña de un usuario
  updateUserPassword(username: string, newPassword: string) {
    return of(null).pipe(
      delay(500),
      tap(() => {
        const usersStore = localStorage.getItem('registeredUsers');
        if (!usersStore) {
          throw new Error('No hay usuarios registrados');
        }

        let users = JSON.parse(usersStore);
        const userIndex = users.findIndex((u: any) => u.username === username);

        if (userIndex === -1) {
          throw new Error('Usuario no encontrado');
        }

        // Actualizar la contraseña del usuario
        users[userIndex].password = newPassword;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        this.registeredUsers = users;
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // Métodos para datos locales
  private loginLocal(usernameOrEmail: string, password: string) {
    return of(null).pipe(
      delay(500), // Simular latencia de red
      tap(() => {
        const user = this.registeredUsers.find(u => 
          (u.username === usernameOrEmail || u.email === usernameOrEmail) && 
          u.password === password
        );

        if (!user) {
          throw new Error('Credenciales incorrectas');
        }

        const { password: _, ...userWithoutPassword } = user;
        this.persistAuthenticatedUser(userWithoutPassword);
      }),
      catchError(error => {
        return throwError(() => new Error('Credenciales incorrectas'));
      })
    );
  }

  private registerLocal(payload: any) {
    return of(null).pipe(
      delay(500), // Simular latencia de red
      tap(() => {
        // Validar que no exista el usuario
        const exists = this.registeredUsers.some(u => 
          u.email === payload.email || u.username === payload.username
        );

        if (exists) {
          throw new Error('El usuario o email ya está registrado');
        }

        // Guardar el usuario
        const newUser = {
          nombre: payload.nombre,
          apellido: payload.apellido,
          username: payload.username,
          email: payload.email,
          institucion: payload.institucion || '',
          password: payload.password // Solo almacenar localmente para demo
        };

        this.registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(this.registeredUsers));
        
        // No loguear automáticamente después del registro
        // El usuario debe ir a login
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  private saveUserLocally(payload: any) {
    const newUser = {
      nombre: payload.nombre,
      apellido: payload.apellido,
      username: payload.username,
      email: payload.email,
      institucion: payload.institucion || '',
      password: payload.password
    };
    this.registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(this.registeredUsers));
  }

  private ensureDemoUser(): void {
    const demoUser = {
      nombre: 'Usuario de prueba',
      apellido: 'Certificados',
      username: this.demoUsername,
      email: 'prueba@academia.local',
      institucion: 'Universidad de Nariño',
      password: '123456'
    };
    const existingIndex = this.registeredUsers.findIndex(
      user => user.username === this.demoUsername
    );

    if (existingIndex === -1) {
      this.registeredUsers.push(demoUser);
    } else {
      this.registeredUsers[existingIndex] = {
        ...this.registeredUsers[existingIndex],
        ...demoUser
      };
    }

    localStorage.setItem('registeredUsers', JSON.stringify(this.registeredUsers));
    this.saveDemoProgress();
  }

  private persistAuthenticatedUser(user: User): void {
    this._user = user;
    localStorage.setItem('user', JSON.stringify(user));

    if (user.username === this.demoUsername) {
      this.saveDemoProgress();
    }
  }

  private saveDemoProgress(): void {
    const completedTopics: Record<string, number[]> = {};
    const completedActivities: Record<string, string[]> = {};

    for (let moduleId = 1; moduleId <= 3; moduleId++) {
      completedTopics[moduleId] = [1, 2, 3];
      for (let topicId = 1; topicId <= 3; topicId++) {
        completedActivities[`${moduleId}-${topicId}`] = ['interactive', 'assignment'];
      }
    }

    localStorage.setItem(`userProgress_${this.demoUsername}`, JSON.stringify({
      completedModules: [1, 2, 3],
      completedTopics,
      completedActivities
    }));
  }
}
