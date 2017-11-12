import { NgModule } from '@angular/core';

import { PortfolioRoutingModule } from './portfolio-routing.module';
import { SharedModule } from './../common/shared/shared.module';
import { PortfolioListComponent } from './portfolio-list/portfolio-list.component';
import { PortfolioDetailComponent } from './portfolio-detail/portfolio-detail.component';

@NgModule({
  imports: [
    SharedModule,
    PortfolioRoutingModule
  ],
  declarations: [
    PortfolioListComponent,
    PortfolioDetailComponent
  ]
})
export class PortfolioModule { }
