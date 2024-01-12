import db from "./db-functions";

class Broker {
  constructor() {}

  async listTradableAssets(): Promise<{ tickerSymbol: string }[]> {
    const tradableAssets = await db.listTradableAssets();
    return tradableAssets;
  }

  async getLatestPrice(tickerSymbol: string): Promise<{ sharePrice: number }> {
    const share = await db.findRecordInRewardAccountPositions(tickerSymbol);
    return { sharePrice: share[0].sharePrice };
  }

  async isMarketOpen(): Promise<{ open: boolean }> {
    // Simulating market status (open for this example)
    return { open: true };
  }

  async buySharesInRewardsAccount(
    tickerSymbol: string,
    quantity: number
  ): Promise<{ success: boolean }> {
    const { sharePrice } = await this.getLatestPrice(tickerSymbol);
    const buyShares = await db.buySharesInRewardsAccount(
      tickerSymbol,
      quantity,
      sharePrice
    );
    return buyShares;
  }

  async getRewardsAccountPositions(): Promise<
    { tickerSymbol: string; quantity: number; sharePrice: number }[]
  > {
    return db.getRewardsAccountPositions();
  }

  async moveSharesFromRewardsAccount(
    toAccount: string,
    tickerSymbol: string,
    quantity: number
  ): Promise<{ success: boolean }> {
    const moveShares = await db.moveSharesFromRewardsAccount(
      toAccount,
      tickerSymbol,
      quantity
    );
    return moveShares;
  }
}

export default Broker;
