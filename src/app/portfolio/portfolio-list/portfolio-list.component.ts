import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Portfolio } from './../../common/interfaces/portfolio';
import { PortfolioService } from './portfolio.service';

@Component({
  selector: 'app-portfolio-list',
  templateUrl: './portfolio-list.component.html',
  styleUrls: ['./portfolio-list.component.scss'],
  providers: [PortfolioService]
})
export class PortfolioListComponent implements OnInit {
  portfolio: Observable<Portfolio[]>;
  showGrid = true;

  constructor(
    private PortfolioService: PortfolioService) { }

  ngOnInit() {
    this.PortfolioService.setTitle();
    this.portfolio = this.PortfolioService.portfolio;
  }

  search(term: string) {
    this.PortfolioService.search(term);
  }
}
