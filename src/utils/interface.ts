
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
    
}


export interface UserAccountRow {
    userId: string;
    username: string;
    shares: string; 
}

export interface UpdatedUserAccount {
    userId: string;
    username: string;
    shares: ShareDetails[] | string; 
}

export interface PopularCompany {
    name: string;
    minPrice: number;
    maxPrice: number;
}