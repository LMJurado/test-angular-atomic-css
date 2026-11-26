import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private readonly clips = new Map<string, HTMLAudioElement>();
  private readonly sources = [
    'assets/img/botones.mp3',
    'assets/img/banner1.mp3',
    'assets/img/banner2f.mp3',
    'assets/img/sonido inicio.mp3'
  ];

  constructor() {
    this.sources.forEach(source => this.getClip(source).load());
  }

  playButtonSound(): void {
    this.play('assets/img/botones.mp3', 0.3);
  }

  playBannerSound(source = 'assets/img/banner2f.mp3'): void {
    this.play(source, 0.5);
  }

  playStartSound(): void {
    this.play('assets/img/sonido inicio.mp3', 0.8);
  }

  private play(source: string, volume: number): void {
    const audio = this.getClip(source);
    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    void audio.play().catch(() => undefined);
  }

  private getClip(source: string): HTMLAudioElement {
    let audio = this.clips.get(source);
    if (!audio) {
      audio = new Audio(source);
      audio.preload = 'auto';
      this.clips.set(source, audio);
    }
    return audio;
  }
}
