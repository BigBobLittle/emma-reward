import * as express from 'express';
import { Request, Response } from 'express';

import { formatResponse, rewardUserWithShare } from './utils/helper'; 
import db from './utils/db-functions';



const app = express();


// Middleware to parse JSON bodies
app.use(express.json());




// sample manual tests
const main = async()=> {
const tradable = await db.listTradableAssets()
const getRewardPositions = await db.getRewardsAccountPositions()

// const byShares = await db.buySharesInRewardsAccount("AAPL", 10, 10)

// DETAILS BEFORE MOVING SHARES 
const userDetails = await db.getUserAccountDetails('1')
const moveShares = await db.moveSharesFromRewardsAccount('1', 'GOOGL', 25)

// AFTER MOVING SHARES 
const positionAfterShares = await db.getRewardsAccountPositions()
const userDetailsAfterShares = await db.getUserAccountDetails('1')

const t = await db.findRecordInRewardAccountPositions('GOOGL')
console.log({tradable, getRewardPositions, userDetails, moveShares, positionAfterShares, userDetailsAfterShares,t})
}
// main()


// endpoint to claim-free-share 
app.post('/claim-free-share', async (req: Request, res: Response) => {
    try {
        const userId: string = req.body.userId;

        // Assign a random share to the user's account
        const awardedShare = await rewardUserWithShare(userId);

        // Fetch user's account details
        const userAccountDetails = await db.getUserAccountDetails(userId);
        
        if (awardedShare) {
            res.status(200).json({message: formatResponse(userAccountDetails)});
        } else {
            res.status(200).send('Free share claimed successfully but not present in user account.');
        }
    } catch (error) {
        // console.log(error)
        res.status(500).send('Error claiming free share');
    }
});





export default app 


