import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

export const routes: Routes = [
  { path: '', loadChildren: 'app/portfolio/portfolio.module#PortfolioModule' },
  { path: 'about', loadChildren: 'app/about/about.module#AboutModule' },
  { path: 'recommendations', loadChildren: 'app/recommendations/recommendations.module#RecommendationsModule' },
  { path: 'contact', loadChildren: 'app/contact/contact.module#ContactModule' }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
