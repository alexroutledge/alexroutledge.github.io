import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';

import { Portfolio } from './../../interfaces/portfolio';
import { portfolioData } from './data';

@Injectable()
export class PortfolioDataService {
  portfolio: Observable<Portfolio[]>;
  private _portfolio: BehaviorSubject<Portfolio[]>;
  private store: { portfolio: any[] };

  // Wapping the data in an Observable as the underlying implementation
  // will eventually call an API and cache the data
  constructor() {
    this.store = { portfolio: portfolioData };
    this._portfolio = new BehaviorSubject(Object.assign({}, this.store).portfolio);
    this.portfolio = this._portfolio.asObservable().map(portfolio => portfolio.map(p => this.setPortfolio(p)));
  }

  private setPortfolio(portfolio: Portfolio) {
    portfolio = this.parseId(portfolio);
    portfolio = this.upperCaseName(portfolio);
    return portfolio;
  }

  private parseId(portfolio: Portfolio) {
    if (!portfolio['id']) {
      portfolio['id'] = +portfolio.url.match(/\/(\d+)/)[1];
    }

    return portfolio;
  }

  private upperCaseName(portfolio: Portfolio) {
    portfolio.name = portfolio.name.charAt(0).toUpperCase() + portfolio.name.slice(1);
    return portfolio;
  }
}
