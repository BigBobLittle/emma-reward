
export interface UserAccount {
    userId: string;
    username: string;
     shares: ShareDetails[] | string;
}

export interface ShareDetails {
    tickerSymbol: string;
    quantity: number;
    sharePrice: number;
}


export interface AwardedShare {
    tickerSymbol: string;
    quantity: number;
    sharePrice?: number
    // Add other share details if needed
}

export interface ShareDetail {
    tickerSymbol: string;
    quantity: number;
    // Other properties related to a share, if any
}


export interface UserAccountRow {
    userId: string;
    username: string;
    shares: string; // The shares column in the database
    // Other properties if any in the UserAccounts table
}

export interface UpdatedUserAccount {
    userId: string;
    username: string;
    shares: ShareDetails[] | string; // Assuming a user can have multiple shares
    // Other user-related information if needed
}