// Generated by Copilot
export interface IEquitySymbol {
    symbol: string;
    symbolId: number;
    description: string;
    securityType: string;
    listingExchange: string;
    isQuotable: boolean;
    isTradable: boolean;
    currency: string;
}

export interface ISymbolSearchResponse {
    symbols: IEquitySymbol[];
}
