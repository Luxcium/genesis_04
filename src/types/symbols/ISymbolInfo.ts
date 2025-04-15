// Generated by Copilot
export interface IMinTickData {
    pivot: number;
    minTick: number;
}

export interface IUnderlyingMultiplierPair {
    multiplier: number;
    underlyingSymbol: string;
    underlyingSymbolId: number;
    cashInLieu: number;
}

export interface ISymbolInfo {
    symbol: string;
    symbolId: number;
    description: string;
    securityType: string;
    listingExchange: string;
    minTicks: IMinTickData[];
    optionContractDeliverables?: {
        underlyings: IUnderlyingMultiplierPair[];
        cashInLieu: number;
    };
    [key: string]: any;
}

export interface IGetSymbolByIdResponse {
    symbols: ISymbolInfo[];
}
