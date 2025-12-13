import { CompanySize, IndustryType } from "@/lib/valuation-logic";

export interface BasicInfo {
    companyName: string;
    taxationPeriod: string; // e.g. "令和5年10月"
    previousPeriod: string; // e.g. "令和4年10月"
    industryType?: IndustryType;
    employees: number;
    capital: number; // 資本金等 (千円)
    issuedShares: number;
    totalAssets: number;
    sales: number;
    // Calculated results
    size: CompanySize;
    lRatio: number;
    sizeMultiplier?: number;
}

export interface Financials {
    // Net Asset Data
    assetsBookValue: number;
    assetsInheritanceValue?: number; // 相続税評価額
    liabilitiesBookValue: number;
    liabilitiesInheritanceValue?: number; // 相続税評価額

    // Comparable Company Inputs
    // A: Stock Price (4 indicators)
    industryStockPriceCurrent: number;       // 課税時期
    industryStockPrice1MonthBefore: number;  // 前月
    industryStockPrice2MonthsBefore: number; // 前々月
    industryStockPricePrevYearAverage: number; // 前年平均

    // Comparable Industry Data (B, C, D)
    industryDividends: number;  // B
    industryProfit: number;     // C
    industryBookValue: number;  // D

    // Own Company Data (b, c, d)
    ownDividends: number; // b
    ownProfit: number;    // c
    ownBookValue: number; // d

    // Step 3 Raw Inputs (for persistence)
    ownDividendPrev?: number;
    ownDividend2Prev?: number;
    ownDividend3Prev?: number;
    ownTaxableIncomePrev?: number;
    ownCarryForwardLossPrev?: number;
    ownTaxableIncome2Prev?: number;
    ownCarryForwardLoss2Prev?: number;
    ownTaxableIncome3Prev?: number;
    ownCarryForwardLoss3Prev?: number;
    ownCapitalPrev?: number;
    ownRetainedEarningsPrev?: number;
    ownCapital2Prev?: number;
    ownRetainedEarnings2Prev?: number;
}
