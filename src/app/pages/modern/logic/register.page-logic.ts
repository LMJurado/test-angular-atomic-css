import { Directive } from '@angular/core';
import {
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { SoundService } from '../../../services/sound.service';

@Directive()
export abstract class RegisterPageLogic {
  loading = false;
  error: string | null = null;

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    institucion: [''],
    password: ['', Validators.required],
    password2: ['', Validators.required]
  });

  constructor(
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private router: Router,
    private sound: SoundService
  ) {}

  submit() {
    this.sound.playButtonSound();
    if (this.form.invalid) return;
    if (this.form.value.password !== this.form.value.password2) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.error = null;

    this.auth.register(this.form.value)
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/login']);
        },
        error: () => {
          this.loading = false;
          this.error = 'No se pudo registrar. Intente de nuevo.';
        }
      });
  }
}
