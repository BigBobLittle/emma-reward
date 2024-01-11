import *  as dotenv from 'dotenv'
import BrokerClass from "./broker";
const Broker = new BrokerClass()
import { AwardedShare, PopularCompany } from "./interface";


dotenv.config()


//  default values or fallbacks if environment variables are not provided
const minShareValue = process.env.MIN_SHARE_VALUE ? parseInt(process.env.MIN_SHARE_VALUE) : 3;
const maxShareValue = process.env.MAX_SHARE_VALUE ? parseInt(process.env.MAX_SHARE_VALUE) : 200;
const targetCostPerAcquisition = process.env.MAX_SHARE_VALUE ? parseInt(process.env.TARGET_COST_PER_ACQUISITION) : 200;

// Function to generate a random reward value within the configured range
function generateRewardValue(): number {
    const rand = Math.random() * 100;
    
    if (rand < 95) {
        return Math.random() * (maxShareValue - minShareValue) + minShareValue; // £3-£10
    } else if (rand < 98) {
        return Math.random() * (25 - minShareValue) + minShareValue; // £10-£25
    } else {
        return Math.random() * (200 - minShareValue) + minShareValue; // £25-£200
    }
}

// reward a user with shares 
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

    
}

// Bonus Task 1. i really don't understand this task
// the algorithm  to distribute rewards in a way that results in total spent to buy shares / number of rewards given = target CPA
function generateRewardValueWithTargetCPA(targetCPA: number, totalSpent: number=targetCostPerAcquisition, numberOfRewardsGiven: number = 100 ): number {
    // Calculate the current CPA
    const currentCPA = totalSpent / numberOfRewardsGiven;

    // Calculate the reward value based on the difference between current and target CPA
    const differenceCPA = targetCPA - currentCPA;

    // Calculate reward value based on the difference and some predefined ranges
    if (differenceCPA > 0) {
        // The current CPA is less than the target CPA
        // Increase the reward value within the range
        const upperBound = Math.min(maxShareValue, targetCPA); 
        const lowerBound = Math.max(minShareValue, targetCPA * 0.3); // Assuming a minimum reward limit of 30% of the target CPA
        return Math.random() * (upperBound - lowerBound) + lowerBound;
    } else {
        // The current CPA is greater than or equal to the target CPA
        // Decrease the reward value within the range
        const upperBound = Math.max(10, targetCPA); // Assuming a minimum reward limit of £10
        const lowerBound = Math.min(3, targetCPA * 0.3); // Assuming a maximum reward limit of 30% of the target CPA
        return Math.random() * (upperBound - lowerBound) + lowerBound;
    }
}

// Bonus Task 2 
// clamp the reward of shares of bigger companies with 3 - 200
function generateFractionShareRewardValue(): number {
    const popularCompanies: PopularCompany[] = [
        { name: 'Apple', minPrice: 100, maxPrice: 150 }, // Assuming Apple's share price range is £100-£150
        { name: 'Google', minPrice: 200, maxPrice: 300 }, // Assuming Google's share price range is £200-£300
        { name: 'Tesla', minPrice: 500, maxPrice: 600 }, // Assuming Tesla's share price range is £500-£600
    ];

    const selectedCompany = popularCompanies[Math.floor(Math.random() * popularCompanies.length)];

    // Generate a random fraction value within the specified price range for the selected company
    const fractionalValue = Math.random() * (selectedCompany.maxPrice - selectedCompany.minPrice) + selectedCompany.minPrice;

    // Clamp the value to ensure it falls within the configured range (£3-£200)
    const clampedFractionalValue = Math.min(maxShareValue, Math.max(minShareValue, fractionalValue));

    return clampedFractionalValue;
}


export {generateRewardValue, rewardUserWithShare}