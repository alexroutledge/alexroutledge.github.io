import { PortfolioPage } from './portfolio.po';
import { browser } from 'protractor';

function sleep() {
  browser.driver.sleep(1500); // sleep for demonstration reasons
}

describe('Portfolio list view', function () {
  let page: PortfolioPage;

  beforeEach(() => {
    page = new PortfolioPage();
  });

  it('should display a list of portfolio items', () => {
    page.navigateTo();
    expect(page.getPortfolioCardElements().count()).toBe(151);
  });

  it('should open and view a particular portfolio item', () => {
    page.navigateTo();
    page.getFirstPortfolioCardElement().click();

    expect(page.getOpenModalElement()).toBeTruthy();
    expect(page.getOpenModalHeadingElement().getText()).toBe('Yell maps');
  });

  it('should open and allow arrow keys to navigate between portfolio items', () => {
    page.navigateTo();
    page.getFirstPortfolioCardElement().click();
    page.selectNextKey();

    expect(page.getOpenModalHeadingElement().getText()).toBe('Yell smartphone');

    page.selectPrevKey();
    page.selectPrevKey();
    expect(page.getOpenModalHeadingElement().getText()).toBe('Veritas');
  });
});
