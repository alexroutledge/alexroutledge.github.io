import { browser, element, by } from 'protractor';

export class PortfolioPage {
  navigateTo() {
    return browser.get('/home');
  }

  getHeadingText() {
    return element(by.css('app-root h1')).getText();
  }
}
