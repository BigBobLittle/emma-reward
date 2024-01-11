import * as sqlite3 from 'sqlite3';
import { ShareDetail, ShareDetails, UserAccount,UserAccountRow, UpdatedUserAccount} from './interface';

class DB {
    private db: sqlite3.Database;

    constructor() {
        this.db = new sqlite3.Database(':memory:'); // Use an in-memory database for this example
        this.initializeDatabase();
    }

    // create an sqlite in memory db with relevant table and seed data 
    private initializeDatabase() {
        // Create tables if they don't exist
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS TradableAssets (
                    id INTEGER PRIMARY KEY,
                    tickerSymbol TEXT NOT NULL
                    
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS RewardsAccountPositions (
                    id INTEGER PRIMARY KEY,
                    tickerSymbol TEXT NOT NULL,
                    quantity INTEGER NOT NULL,
                    sharePrice REAL NOT NULL
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS UserAccounts (
                    userId INTEGER PRIMARY KEY,
                    username TEXT NOT NULL,
                    shares TEXT
                    
                )
            `);

            // insert default users 
            const baseUsers = [
                { userId: '1', username: 'user1' },
                { userId: '2', username: 'user2' }
                
            ];
        
            const insertUserStmt = this.db.prepare('INSERT INTO UserAccounts (userId, username) VALUES (?, ?)');
            baseUsers.forEach(user => insertUserStmt.run(user.userId, user.username));
            insertUserStmt.finalize();

            // Insert default tradable assets
            const defaultAssets = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];

            const insertStmt = this.db.prepare('INSERT INTO TradableAssets (tickerSymbol) VALUES (?)');
            // const insertOrUpdateStmt = this.db.prepare('INSERT OR REPLACE INTO TradableAssets (tickerSymbol, quantity) VALUES (?, COALESCE((SELECT quantity FROM TradableAssets WHERE tickerSymbol = ?), 0) + 1)');
            defaultAssets.forEach((asset) => insertStmt.run(asset));
            insertStmt.finalize();

            // reward accoount position 
            // SQL command to insert seed data into RewardsAccountPositions
            const seedData = [
                { tickerSymbol: 'AAPL', quantity: 100, sharePrice: 150 },
                { tickerSymbol: 'GOOGL', quantity: 50, sharePrice: 200 },
                { tickerSymbol: 'MSFT', quantity: 50, sharePrice: 100 },
                { tickerSymbol: 'AMZN', quantity: 100, sharePrice: 300 },
                { tickerSymbol: 'TSLA', quantity: 50, sharePrice: 250 },
                // Add more seed data for other ticker symbols
            ];

            // Seed the RewardsAccountPositions table with initial data
            seedData.forEach((data) => {
                this.db.run(
                    'INSERT INTO RewardsAccountPositions (tickerSymbol, quantity, sharePrice) VALUES (?, ?, ?)',
                    [data.tickerSymbol, data.quantity, data.sharePrice],
                    (err) => {
                        if (err) {
                            console.error('Error inserting seed data:', err);
                        } else {
                            console.log('Seed data inserted successfully!');
                        }
                    }
                );
            });

        });
    }

    // list all Tradable Assets 
    async listTradableAssets(): Promise<{ tickerSymbol: string }[]> {
        return new Promise<{ tickerSymbol: string }[]>((resolve, reject) => {
            this.db.all('SELECT tickerSymbol FROM TradableAssets', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    
                    const assets: { tickerSymbol: string }[] = rows.map((row: any) => ({
                        tickerSymbol: row.tickerSymbol,
                    }));
                    resolve(assets);
                }
            });
        });
    }

// fetch all records in Rewards table 
    async getRewardsAccountPositions(): Promise<{ tickerSymbol: string, quantity: number, sharePrice: number }[]> {
        return new Promise<{ tickerSymbol: string, quantity: number, sharePrice: number }[]>((resolve, reject) => {
            this.db.all('SELECT * FROM RewardsAccountPositions', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    
                    const positions: { tickerSymbol: string, quantity: number, sharePrice: number }[] = rows.map((row: any) => ({
                        tickerSymbol: row.tickerSymbol,
                        quantity: row.quantity,
                        sharePrice: row.sharePrice
                    }));
                    resolve(positions);
                }
            });
        });
    }

    // by new shares into rewards table 
    async buySharesInRewardsAccount(tickerSymbol: string, quantity: number, sharePrice:number): Promise<{ success: boolean }> {
        return new Promise<{ success: boolean }>((resolve, reject) => {
            this.db.run(
                'INSERT INTO RewardsAccountPositions (tickerSymbol, quantity, sharePrice) VALUES (?, ?, ?)',
                [tickerSymbol, quantity, sharePrice],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ success: true });
                    }
                }
            );
        });
    }
    
    // update the quantity of a share given it's tickerSymbol
    async updateFirmsAccountWithShares(tickerSymbol: string, quantity: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(
                'UPDATE RewardsAccountPositions SET quantity = quantity - ? WHERE tickerSymbol = ?',
                [quantity, tickerSymbol],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }


    // fetch a single record in Rewards table given it's tickerSymbol
    async findRecordInRewardAccountPositions(tickerSymbol:string):Promise<ShareDetails>{
    return new Promise<ShareDetails>((resolve, reject) => {
     this.db.all('SELECT * FROM RewardsAccountPositions WHERE tickerSymbol = ?', [tickerSymbol], (err, updatedRows:ShareDetails) => {
        if (err) {
            this.db.run('ROLLBACK');
            reject(err);
            return;
        }

        
        resolve(updatedRows); 
    }); 
        })
    }
    
    // decrease the quantity of a specific ticker symbol 
    decreaseQuantityInRewardsByTickerSymbol(tickerSymbol:string, quantity:number):Promise<void>{
        return new Promise<void>((_, reject) =>{
            this.db.run(
                'UPDATE RewardsAccountPositions SET quantity = quantity - ? WHERE tickerSymbol = ?',
                [quantity, tickerSymbol],
                (err) => {
                    if (err) {
                        // this.db.run('ROLLBACK');
                        reject(err);
                        return;
                    }})
        })
    }


/**
 * description move shares from the firms account to a user account, decrease 
 * the firms quantity and increase that of the user 
 */
    async moveSharesFromRewardsAccount(toAccount: string, tickerSymbol: string, quantity: number): Promise<{ success: boolean }> {
        return new Promise<{ success: boolean }>(async (resolve, reject) => {
            try {
                this.db.run('BEGIN TRANSACTION');
    
                // Decrease the quantity in RewardsAccountPositions
                this.db.run(
                    'UPDATE RewardsAccountPositions SET quantity = quantity - ? WHERE tickerSymbol = ?',
                    [quantity, tickerSymbol],
                    (err) => {
                        if (err) {
                            this.db.run('ROLLBACK');
                            reject(err);
                            return;
                        }
    
                       
                        // Fetch the current user shares
                        this.db.get('SELECT * FROM UserAccounts WHERE userId = ?', [toAccount], async(err, row:UpdatedUserAccount|null) => {
                            if (err) {
                                this.db.run('ROLLBACK');
                                reject(err);
                                return;
                            }
    
                            if (row && Object.prototype.hasOwnProperty.call(row, 'shares')) {
                                let updatedShares: ShareDetails[] = [];
    
                                if (row.shares) {
                                    const sharesDataFromDB: any = row.shares;
                                    updatedShares = JSON.parse(sharesDataFromDB);
                                }
    
                                const existingShareIndex = updatedShares.findIndex((share) => share.tickerSymbol === tickerSymbol);
    
                                if (existingShareIndex !== -1) {
                                    updatedShares[existingShareIndex].quantity += quantity;
                                } else {
                                    // get latest share price 
                                     const data = await this.findRecordInRewardAccountPositions(tickerSymbol)
                                   
                                     if (!row.shares) {
                                        updatedShares = [{ tickerSymbol, quantity, sharePrice: data[0].sharePrice }]; 
                                    } else {
                                        updatedShares.push({ tickerSymbol, quantity, sharePrice: data[0].sharePrice }); 
                                    }
                                   
                                }
    
                                // Update the shares in the UserAccounts table
                                this.db.run(
                                    'UPDATE UserAccounts SET shares = ? WHERE userId = ?',
                                    [JSON.stringify(updatedShares), toAccount],
                                    (err) => {
                                        if (err) {
                                            this.db.run('ROLLBACK');
                                            reject(err);
                                            return;
                                        }
    
                                        this.db.run('COMMIT');
                                        resolve({ success: true });
                                    }
                                );
                            } else {
                                this.db.run('ROLLBACK');
                                reject(new Error(`User with ID ${toAccount} not found or no shares data`));
                            }
                        });
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }
    
    
    
    

 
    
 // Logic to fetch user account details including shares from the database
    async  getUserAccountDetails(userId: string): Promise<UserAccount> { 
        return new Promise<UserAccount>((resolve, reject) => {
            this.db.get('SELECT * FROM UserAccounts WHERE userId = ?', [userId], (err, row: UserAccount | undefined) => {
                if (err) {
                    reject(err);
                } else {
                    if (row) {
                        const userAccount: UserAccount = {
                            userId: row.userId,
                            username: row.username,
                            shares: row.shares, 
                        };
                        resolve(userAccount);
                    } else {
                        reject(new Error(`User with ID ${userId} not found`));
                    }
                }
            });
        });
    }
   
    
}

const db = new DB()
export default db