import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/startWith';

import { Portfolio } from './../../common/interfaces/portfolio';
import { PortfolioDataService } from './../../common/core/services/portfolio-data.service';

@Injectable()
export class PortfolioService {
  readonly portfolio: Observable<Portfolio[]>;
  private searchTerm = new Subject<string>();

  constructor(
    private title: Title,
    private PortfolioDataService: PortfolioDataService
  ) {
    this.portfolio = this.PortfolioDataService.portfolio.switchMap(portfolio =>
      this.searchTerm
        .map(term => this.filter(portfolio, term))
        .startWith(portfolio));
  }

  setTitle() {
    this.title.setTitle('Search for portfolio items');
  }

  search(term: string) {
    this.searchTerm.next(term);
  }

  private filter(portfolio: Portfolio[], value: string) {
    return portfolio.filter(p => value ? p.name.toLowerCase().includes(value.toLowerCase()) : portfolio);
  }
}
