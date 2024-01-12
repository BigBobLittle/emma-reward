
import {DB} from '../utils/db-functions';

describe('DB Class', () => {
  let db: DB;

  beforeEach(() => {
    db = new DB();
  });

  

  test('listTradableAssets should return tradable assets', async () => {
    const assets = await db.listTradableAssets();
    expect(assets.length).toBeGreaterThan(0);
  });

  test('getRewardsAccountPositions should return rewards account positions', async () => {
    const positions = await db.getRewardsAccountPositions();
    expect(positions.length).toBeGreaterThan(0);
  });

  test('buySharesInRewardsAccount should add shares to rewards account', async () => {
    const tickerSymbol = 'AAPL';
    const quantity = 10;
    const sharePrice = 150;

    const result = await db.buySharesInRewardsAccount(tickerSymbol, quantity, sharePrice);
    expect(result.success).toBe(true);
  });

  
});

