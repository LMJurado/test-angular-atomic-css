import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { AdminComponent } from './admin.component';
import { AdministrationRoutingModule } from './administration-routing.module';

@NgModule({
  declarations: [AdminComponent],
  imports: [SharedModule, AdministrationRoutingModule]
})
export class AdministrationModule {}
