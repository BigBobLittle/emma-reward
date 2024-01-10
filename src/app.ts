// app.ts

// import  Broker  from './utils/broker';



import * as express from 'express';
import { Request, Response } from 'express';
import Broker from './utils/broker';
import { rewardUserWithShare } from './utils/helper'; // Assuming the method is exported from util.helper.ts
import db from './utils/db-functions';
import { log } from 'console';
import { ShareDetails } from './utils/interface';

const app = express();
const broker = new Broker();

// Middleware to parse JSON bodies
app.use(express.json());


// Start the application
// const initializeApp = async () => {
//     const broker = new Broker();

//     // Fetch and display the default tradable assets
//     const tradableAssets = await broker.listTradableAssets();
//     console.log('Default Tradable Assets:', tradableAssets);

//     // get user account 
//     // const userDetails = await db.getUserAccountDetails('1')
//     // console.log({userDetails})
// };

// // Run the application
// initializeApp().catch((error) => {
//     console.error('An error occurred while initializing the app:', error);
// });

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
main()

const formatResponse = (response) => {
    // Example variable that might contain either a string or ShareDetails[]
let data: string | ShareDetails[] = response.shares; // Example function to retrieve the data


// Check the type and handle accordingly
if (typeof data === 'string') {
    // If it's a string, parse it into an array of ShareDetails
    const parsedData: ShareDetails[] = JSON.parse(data);
    return {...response, shares: parsedData}
    // Now parsedData is an array of ShareDetails that you can use
} 
    return response



}
app.post('/claim-free-share', async (req: Request, res: Response) => {
    try {
        const userId: string = req.body.userId;

        // Assign a random share to the user's account
        const awardedShare = await rewardUserWithShare(userId);

        // Fetch user's account details
        const userAccountDetails = await db.getUserAccountDetails(userId);
        // console.log({userAccountDetails})
        
        log(typeof userAccountDetails.shares)
        if (awardedShare) {
            res.status(200).json({message: formatResponse(userAccountDetails)});
        } else {
            res.status(200).send('Free share claimed successfully but not present in user account.');
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Error claiming free share');
    }
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



