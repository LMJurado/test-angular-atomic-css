import { NgModule } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { LocalStorageProgressRepository, ProgressRepository } from './repositories/progress.repository';

@NgModule({
  providers: [
    AuthService,
    { provide: ProgressRepository, useExisting: LocalStorageProgressRepository }
  ]
})
export class CoreModule {}
