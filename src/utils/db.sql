-- Create the TradableAssets table
CREATE TABLE
    TradableAssets (
        id INTEGER PRIMARY KEY,
        tickerSymbol TEXT NOT NULL
    );

-- Create the RewardsAccountPositions table
CREATE TABLE
    RewardsAccountPositions (
        id INTEGER PRIMARY KEY,
        tickerSymbol TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        sharePrice REAL NOT NULL
    );