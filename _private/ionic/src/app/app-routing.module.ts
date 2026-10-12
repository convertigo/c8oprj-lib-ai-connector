import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
//  { path: '', redirectTo: 'home', pathMatch: 'full' },
//  { path: 'home', loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)},
 { path: '', redirectTo: 'path-to-xfirst', pathMatch: 'full' },
 { path: 'path-to-xfirst', loadChildren: () => import('./pages/page/page.module').then( m => m.PageModule)}

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
