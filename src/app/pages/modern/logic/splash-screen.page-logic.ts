import { Directive, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Directive()
export abstract class SplashScreenPageLogic implements OnInit {
  isExiting = false;

  constructor(private router: Router) {}

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
    try {
      const audio = new Audio('assets/img/sonido inicio.mp3');
      audio.volume = 0.8; // Volumen al 80%
      audio.play().catch(error => {
        console.log('No se pudo reproducir el sonido:', error);
      });
    } catch (error) {
      console.log('Error al intentar reproducir el sonido:', error);
    }
  }
}
