import { Directive } from '@angular/core';
import {
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { SoundService } from '../../../services/sound.service';

@Directive()
export abstract class ForgotPasswordPageLogic {
  loading = false;
  error: string | null = null;
  success: string | null = null;
  step: 'username' | 'reset' = 'username';
  foundUsername: string = '';

  usernameForm = this.fb.group({
    username: ['', Validators.required]
  });

  resetForm = this.fb.group({
    password: ['', Validators.required],
    password2: ['', Validators.required]
  });

  constructor(
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private router: Router,
    private sound: SoundService
  ) {}

  submitUsername() {
    this.sound.playButtonSound();
    if (this.usernameForm.invalid) return;
    this.loading = true;
    this.error = null;
    this.success = null;

    const { username } = this.usernameForm.value;

    // Verificar si el usuario existe
    this.auth.userExists(username!).subscribe({
      next: exists => setTimeout(() => {
        this.loading = false;
        if (exists) {
          this.foundUsername = username!;
          this.success = 'Usuario encontrado. Procede a cambiar tu contraseña.';
          this.step = 'reset';
        } else {
          this.error = 'El nombre de usuario no existe en el sistema.';
        }
      }, 400),
      error: () => {
        this.loading = false;
        this.error = 'No se pudo consultar el usuario.';
      }
    });
  }

  submitReset() {
    this.sound.playButtonSound();
    if (this.resetForm.invalid) return;
    if (this.resetForm.value.password !== this.resetForm.value.password2) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.error = null;

    const { password } = this.resetForm.value;

    // Actualizar contraseña del usuario
    this.auth.updateUserPassword(this.foundUsername, password!).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Contraseña actualizada exitosamente. Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: () => {
        this.loading = false;
        this.error = 'Error al actualizar la contraseña. Intente de nuevo.';
      }
    });
  }

  backToLogin() {
    this.sound.playButtonSound();
    this.router.navigate(['/login']);
  }
}
