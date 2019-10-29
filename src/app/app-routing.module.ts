import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ShareVideoComponent } from './share-video/share-video.component';
import { AppComponent } from './app.component';
import { VideoComponent } from './video/video.component';


const routes: Routes = [
  {
    path: 'share', component: ShareVideoComponent
  },
  {
    path: 'video', component: VideoComponent
  },
  {
    path: '', component: VideoComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,
    preloadingStrategy: PreloadAllModules,
    enableTracing: false,
    onSameUrlNavigation: 'ignore', //  'reload' | 'ignore'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
