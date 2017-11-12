import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/do';

import { Portfolio } from './../../common/interfaces/portfolio';
import { PortfolioDataService } from './../../common/core/services/portfolio-data.service';

@Component({
  selector: 'app-portfolio-detail',
  templateUrl: './portfolio-detail.component.html',
  styleUrls: ['./portfolio-detail.component.scss']
})
export class PortfolioDetailComponent implements OnInit, OnDestroy {
  portfolio: Observable<Portfolio>;

  constructor(
    private title: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private PortfolioDataService: PortfolioDataService) { }

  ngOnInit() {
    this.portfolio = this.activatedRoute.params.distinctUntilChanged()
      .mergeMap(params => this.PortfolioDataService.portfolio.map(portfolio => portfolio.find(p => p.id === params.id)))
      .do(portfolio => this.title.setTitle(`${portfolio.name}`));
}

  ngOnDestroy() {
    this.title.setTitle('Search for portfolio items');
  }

  next() {
    const paramId = +this.activatedRoute.snapshot.params.id;
    const id = paramId === 1 ? 151 : paramId - 1;
    this.router.navigateByUrl(`/portfolio/${id}`);
  }

  previous() {
    const paramId = +this.activatedRoute.snapshot.params.id;
    const id = paramId < 151 ? paramId + 1 : 1;
    this.router.navigateByUrl(`/portfolio/${id}`);
  }

  close() {
    this.router.navigateByUrl('/portfolio');
  }
}
