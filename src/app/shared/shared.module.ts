import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Badge } from '../css/atoms/badge/badge';
import { Button } from '../css/atoms/button/button';
import { PaginationComponent } from './components/pagination/pagination.component';

@NgModule({
  declarations: [PaginationComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, Button, Badge],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, Button, Badge, PaginationComponent]
})
export class SharedModule {}
