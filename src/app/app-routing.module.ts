import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ShareVideoComponent } from './share-video/share-video.component';
import { AppComponent } from './app.component';


const routes: Routes = [
  {
    path: '', component: AppComponent,
    children: [
      {
          path: 'share', component: ShareVideoComponent
      }
    ]
  },
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
