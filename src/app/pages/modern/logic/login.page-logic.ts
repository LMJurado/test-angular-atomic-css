import { Directive } from '@angular/core';
import {
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { SoundService } from '../../../services/sound.service';

@Directive()
export abstract class LoginPageLogic {

  loading = false;
  error: string | null = null;

  form = this.fb.group({
    usernameOrEmail: ['', Validators.required],
    password: ['', Validators.required]
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
    this.loading = true;
    this.error = null;

    const { usernameOrEmail, password } = this.form.value;

    this.auth.login(usernameOrEmail!, password!)
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/inicio']);
        },
        error: () => {
          this.loading = false;
          this.error = 'Credenciales incorrectas';
        }
      });
  }
}