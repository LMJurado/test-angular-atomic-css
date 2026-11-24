import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../atoms/icon/icon';
import { Typography } from '../../atoms/typography/typography';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, Icon, Typography],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  readonly currentYear = new Date().getFullYear();
}
