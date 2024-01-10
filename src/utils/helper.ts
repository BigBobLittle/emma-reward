import BrokerClass from "./broker";
import db from "./db-functions";
const Broker = new BrokerClass()
import { AwardedShare } from "./interface";

// generates a random reward value according to the specified distribution.
function generateRewardValue(): number {
    const rand = Math.random() * 100;
    if (rand < 95) {
        return Math.random() * (10 - 3) + 3; // £3-£10
    } else if (rand < 98) {
        return Math.random() * (25 - 10) + 10; // £10-£25
    } else {
        return Math.random() * (200 - 25) + 25; // £25-£200
    }
}

// unction to handle the reward distribution, purchasing shares, and moving them to the user's account.
// async function rewardUserWithShare(userId: string): Promise<void> {
//     const rewardValue = generateRewardValue();
//     const tradableAssets = await Broker.listTradableAssets();
//     const randomAssetIndex = Math.floor(Math.random() * tradableAssets.length);
//     const randomAsset = tradableAssets[randomAssetIndex];

//     const latestPrice = await Broker.getLatestPrice(randomAsset.tickerSymbol);
//     const sharePrice = latestPrice.sharePrice;

//     const quantityToPurchase = Math.ceil(rewardValue / sharePrice);

//     try {
//         const marketStatus = await Broker.isMarketOpen();
//         if (marketStatus.open) {
//             await Broker.buySharesInRewardsAccount(randomAsset.tickerSymbol, quantityToPurchase);

//             const moveSharesResult = await Broker.moveSharesFromRewardsAccount(userId, randomAsset.tickerSymbol, quantityToPurchase);

//             if (moveSharesResult.success) {
//                 console.log(`Reward of ${randomAsset.tickerSymbol} shares worth £${rewardValue} has been given to user ${userId}`);
//             } else {
//                 console.log(`Failed to transfer shares to user ${userId}`);
//             }
//         } else {
//             console.log('Market is closed. Cannot purchase shares at the moment.');
//         }
//     } catch (error) {
//         console.error('Error occurred:', error);
//     }
// }

async function rewardUserWithShare(userId: string): Promise<AwardedShare> {
    const rewardValue = generateRewardValue();
    const tradableAssets = await Broker.listTradableAssets();
    const randomAssetIndex = Math.floor(Math.random() * tradableAssets.length);
    const randomAsset = tradableAssets[randomAssetIndex];

    const latestPrice = await Broker.getLatestPrice(randomAsset.tickerSymbol);
    const sharePrice = latestPrice.sharePrice;

    const quantityToPurchase = Math.ceil(rewardValue / sharePrice);

    try {
        const marketStatus = await Broker.isMarketOpen();
        if (marketStatus.open) {
            await Broker.buySharesInRewardsAccount(randomAsset.tickerSymbol, quantityToPurchase);

            const moveSharesResult = await Broker.moveSharesFromRewardsAccount(userId, randomAsset.tickerSymbol, quantityToPurchase);

            if (moveSharesResult.success) {
                 // Update user's share information in the UserAccounts table
                //  await db.updateUsersSharesInDB(userId, randomAsset.tickerSymbol, quantityToPurchase, rewardValue);
                // console.log(`Reward of ${randomAsset.tickerSymbol} shares worth £${rewardValue} has been given to user ${userId}`);
                return { tickerSymbol: randomAsset.tickerSymbol, quantity: quantityToPurchase, sharePrice:rewardValue }; // Return the awarded share details
            } else {
                console.log(`Failed to transfer shares to user ${userId}`);
            }
        } else {
            console.log('Market is closed. Cannot purchase shares at the moment.');
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }

    // Return a default value or throw an error if the share awarding process fails
    throw new Error('Failed to award shares');
}


export {generateRewardValue, rewardUserWithShare}