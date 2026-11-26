import { Directive, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SoundService } from '../../../services/sound.service';

@Directive()
export abstract class SplashScreenPageLogic implements OnInit {
  isExiting = false;

  constructor(private router: Router, private sound: SoundService) {}

  ngOnInit(): void {
    // Esperar 3.5 segundos para iniciar la transición de salida
    setTimeout(() => {
      this.isExiting = true;
      // Reproducir el sonido
      this.playStartSound();
      // Esperar 0.5 segundos más para que termine la animación y luego navegar
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 500);
    }, 3500);
  }

  playStartSound(): void {
    this.sound.playStartSound();
  }
}
