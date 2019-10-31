import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { JwtModule } from '@auth0/angular-jwt';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoComponent } from './video/video.component';
import { HeaderComponent } from './shared/header/header.component';
import { ShareVideoComponent } from './share-video/share-video.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { environment } from 'src/environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { SocketService } from './shared/socket.service';

export function getToken() {
  return localStorage.getItem(environment.token);
}

@NgModule({
  declarations: [
    AppComponent,
    VideoComponent,
    HeaderComponent,
    ShareVideoComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: getToken,
        whitelistedDomains: ['localhost:44368', 'backendyoutube.azurewebsites.net'],
        skipWhenExpired: true
      }
    }),
  ],
  providers: [SocketService],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule { }
