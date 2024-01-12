import Broker from '../utils/broker';

describe('Broker Class Tests', () => {
  let broker: Broker;

  beforeEach(() => {
    broker = new Broker();
  });


  it('should list tradable assets', async () => {
    const tradableAssets = await broker.listTradableAssets();
    expect(Array.isArray(tradableAssets)).toBe(true);
    expect(tradableAssets.length).toBeGreaterThanOrEqual(0);
    expect(tradableAssets[0]).toHaveProperty('tickerSymbol');
  });

  it('should get rewards account positions', async () => {
    const rewardsAccountPositions = await broker.getRewardsAccountPositions();
    
    expect(rewardsAccountPositions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tickerSymbol: expect.any(String),
          quantity: expect.any(Number),
          sharePrice: expect.any(Number),
        }),
      ])
    );
  });
  
  it('should check if the market is open', async () => {
    const marketStatus = await broker.isMarketOpen();
    expect(marketStatus).toHaveProperty('open');
    expect(marketStatus.open).toEqual(expect.any(Boolean));
  });

  it('should buy shares in the rewards account', async () => {
    const tickerSymbol = 'AAPL';
    const quantity = 10;
    const buyResult = await broker.buySharesInRewardsAccount(tickerSymbol, quantity);
    expect(buyResult).toHaveProperty('success');
    expect(buyResult.success).toEqual(true);
  });

  

  it('should move shares from rewards account to user account', async () => {
    const toAccount = '1';
    const tickerSymbol = 'AAPL';
    const quantity = 5;
    const moveResult = await broker.moveSharesFromRewardsAccount(toAccount, tickerSymbol, quantity);
    expect(moveResult).toHaveProperty('success');
    expect(moveResult.success).toEqual(true);
  });

  
});






