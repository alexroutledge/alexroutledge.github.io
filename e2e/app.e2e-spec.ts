import { PortfolioPage } from './app.po';

describe('Portfolio App', function() {
  let page: PortfolioPage;

  beforeEach(() => {
    page = new PortfolioPage();
  });

  it('should display heading saying Alex Routledge', () => {
    page.navigateTo();
    expect(page.getHeadingText()).toEqual('Alex Routledge');
  });
});
