import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ModernSplashComponent } from './features/splash/splash.component';
import { ModernLayoutComponent } from './pages/modern/modern-layout.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent, ModernLayoutComponent, ModernSplashComponent],
  imports: [BrowserModule, AppRoutingModule, CoreModule, SharedModule],
  providers: [provideHttpClient(withXhr(), withInterceptorsFromDi())],
  bootstrap: [AppComponent]
})
export class AppModule {}
