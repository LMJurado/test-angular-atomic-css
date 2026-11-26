import { NgModule } from '@angular/core';

import { ModernForgotPasswordComponent, ModernLoginComponent, ModernRegisterComponent } from '../../pages/modern/modern-pages.components';
import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [ModernLoginComponent, ModernRegisterComponent, ModernForgotPasswordComponent],
  imports: [SharedModule, AuthRoutingModule]
})
export class AuthModule {}
