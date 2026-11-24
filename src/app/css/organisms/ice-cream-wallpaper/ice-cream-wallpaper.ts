import { Component } from '@angular/core';

@Component({
  selector: 'app-ice-cream-wallpaper',
  standalone: true,
  templateUrl: './ice-cream-wallpaper.html',
  styleUrl: './ice-cream-wallpaper.css',
})
export class IceCreamWallpaper {
  readonly icons = Array.from({ length: 144 }, (_, index) => index);
}
