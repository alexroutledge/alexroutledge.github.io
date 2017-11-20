import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from './../common/shared/shared.module';
import { RecommendationsComponent } from './recommendations.component';

const routes: Routes = [
  { path: '', component: RecommendationsComponent }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    RecommendationsComponent
  ]
})
export class RecommendationsModule { }
