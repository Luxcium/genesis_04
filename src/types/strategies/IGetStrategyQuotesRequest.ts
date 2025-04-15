// Generated by Copilot
export interface IStrategyQuoteRequest {
    variants: IStrategyVariantRequest[];
}

export interface IStrategyVariantRequest {
    variantId: number;
    strategy: string;
    legs: IStrategyLeg[];
}

export interface IStrategyLeg {
    symbolId: number;
    action: 'Buy' | 'Sell';
    ratio: number;
}
