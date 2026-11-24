import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  constructor() { }

  playButtonSound(): void {
    try {
      const audio = new Audio('assets/img/botones.mp3');
      audio.volume = 0.3; // Volumen bajo (30%) para ser agradable
      audio.play().catch(error => {
        console.log('No se pudo reproducir el sonido del botón:', error);
      });
    } catch (error) {
      console.log('Error al intentar reproducir el sonido:', error);
    }
  }
}
