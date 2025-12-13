import { BasicInfo, Financials } from "@/types/valuation";

export type IndustryType = "Wholesale" | "RetailService" | "Other";

export type CompanySize = "Big" | "Medium" | "Small";

export interface CompanySizeResult {
    size: CompanySize;
    sizeMultiplier: 0.7 | 0.6 | 0.5; // coefficient for Similar Industry Value (A)
    lRatio: 1.00 | 0.90 | 0.75 | 0.60 | 0.50 | 0.00; // L for blending
}

/**
 * Calculates Company Size, Size Multiplier, and L Ratio.
 * Based on National Tax Agency Notice 179.
 */
export function calculateCompanySizeAndL(data: {
    employees: number;
    sales: number;      // Yen
    totalAssets: number; // Yen
    industryType: IndustryType;
}): CompanySizeResult {
    const { employees, sales, totalAssets, industryType } = data;
    const salesMillion = sales / 1_000_000;
    const assetsMillion = totalAssets / 1_000_000;

    // 1. Big Company Check
    // Criteria: Employees >= 70 OR Sales >= Threshold
    let isBig = false;
    if (employees >= 70) isBig = true;

    // Sales Major Thresholds for Big
    if (industryType === "Wholesale" && salesMillion >= 3000) isBig = true;
    else if (industryType === "RetailService" && salesMillion >= 2000) isBig = true; // Corrected from 1000 to 2000 based on L-ratio table upper bounds
    else if (industryType === "Other" && salesMillion >= 1500) isBig = true;

    if (isBig) {
        return {
            size: "Big",
            sizeMultiplier: 0.7,
            lRatio: 1.00 // Big companies use Similar Industry Method (effectively L=1.0) or Net Asset (Choice)
        };
    }

    // 2. Small Company Check
    // Criteria: Sales < Small Threshold (and usually Emp is small, but Sales is primary driver in flow)
    // Small Thresholds (Bottom of Medium Table)
    let isSmall = false;
    if (industryType === "Wholesale" && salesMillion < 200) isSmall = true;
    else if (industryType === "RetailService" && salesMillion < 60) isSmall = true;
    else if (industryType === "Other" && salesMillion < 100) isSmall = true;

    // Additionally, Employee count restriction often applies for Medium L tables (e.g. >5). 
    // If employees <= 5, it typically falls to Small (Net Asset) unless Sales are huge? 
    // The text says "excluding companies with <= 5 employees" from the 0.60 tier of Medium.
    // If a company has high sales but <=5 employees, it might technically be Small or specific rule applies. 
    // For simplicity here: If Sales match Medium range, we allow Medium logic but L might be affected.
    // However, usually < 5 employees -> Small.
    if (employees <= 5) isSmall = true;

    if (isSmall) {
        return {
            size: "Small",
            sizeMultiplier: 0.5,
            lRatio: 0.50 // Small companies use Net Asset, optional L=0.50 blending
        };
    }

    // 3. Medium Company - Calculate L
    // Medium Size Multiplier is always 0.6
    const sizeMultiplier = 0.6;

    // Calculate L based on Assets & Employees (Table 1)
    let l_assets = 0.0;

    // Helper to check Asset/Emp criteria
    // Wholesale
    if (industryType === "Wholesale") {
        if (assetsMillion >= 400 && employees > 35) l_assets = 0.90;
        else if (assetsMillion >= 200 && employees > 20) l_assets = Math.max(l_assets, 0.75);
        else if (assetsMillion >= 70 && employees > 5) l_assets = Math.max(l_assets, 0.60);
    }
    // Retail/Service
    else if (industryType === "RetailService") {
        if (assetsMillion >= 500 && employees > 35) l_assets = 0.90;
        else if (assetsMillion >= 250 && employees > 20) l_assets = Math.max(l_assets, 0.75);
        else if (assetsMillion >= 40 && employees > 5) l_assets = Math.max(l_assets, 0.60);
    }
    // Other
    else {
        if (assetsMillion >= 500 && employees > 35) l_assets = 0.90;
        else if (assetsMillion >= 250 && employees > 20) l_assets = Math.max(l_assets, 0.75);
        else if (assetsMillion >= 50 && employees > 5) l_assets = Math.max(l_assets, 0.60);
    }

    // Calculate L based on Sales (Table 2)
    let l_sales = 0.0;

    // Wholesale
    if (industryType === "Wholesale") {
        if (salesMillion >= 700) l_sales = 0.90; // Top is < 3000 (Big)
        else if (salesMillion >= 350) l_sales = Math.max(l_sales, 0.75);
        else if (salesMillion >= 200) l_sales = Math.max(l_sales, 0.60);
    }
    // Retail/Service

    // Retail/Service
    else if (industryType === "RetailService") {
        if (salesMillion >= 500) l_sales = 0.90; // Top is < 2000
        else if (salesMillion >= 250) l_sales = Math.max(l_sales, 0.75);
        else if (salesMillion >= 60) l_sales = Math.max(l_sales, 0.60);
    }
    // Other
    else {
        if (salesMillion >= 400) l_sales = 0.90; // Top is < 1500
        else if (salesMillion >= 200) l_sales = Math.max(l_sales, 0.75);
        else if (salesMillion >= 80) l_sales = Math.max(l_sales, 0.60);
    }

    // "Use the larger of the two percentages"
    let lRatio = Math.max(l_assets, l_sales) as 0.90 | 0.75 | 0.60;

    // Fallback? If it fell through cracks (e.g. Sales in Medium range but Assets very low?), 
    // usually Sales determines 'Medium' status. If Sales is Medium, we usually get at least 0.60 from Sales table.
    if ((lRatio as number) === 0) lRatio = 0.60;

    return {
        size: "Medium",
        sizeMultiplier,
        lRatio
    };
}

export interface SimilarIndustryResult {
    value: number; // Final floored value (S)
    S_50_Raw: number; // Precision value per 50 yen
    ratios: {
        b: number; c: number; d: number;
        B: number; C: number; D: number;
        ratioB: number; ratioC: number; ratioD: number;
        avgRatio: number;
    };
    conversion: {
        ratio: number;
        shareCount50: number;
    };
    multiplier: number;
    A: number;
}

export function calculateDetailedSimilarIndustryMethod(
    A: number,
    B: number, C: number, D: number,
    b: number, c: number, d: number,
    multiplier: number,
    basicInfo: { issuedShares: number },
    ownCapitalPrev: number // in Thousand Yen (from Step 3 raw data effectively)
): SimilarIndustryResult {
    let S_50_Raw = 0;
    let ratioB = 0, ratioC = 0, ratioD = 0, avgRatio = 0;

    // Check if denominators are valid (not zero)
    if (B !== 0 && C !== 0 && D !== 0) {
        ratioB = b / B;
        ratioC = c / C;
        ratioD = d / D;
        avgRatio = (ratioB + ratioC + ratioD) / 3;

        // Raw S_50 (Not floored yet)
        S_50_Raw = A * avgRatio * multiplier;
    }

    // Convert to Actual Share Value
    const capitalPrevYen = ownCapitalPrev ? ownCapitalPrev * 1000 : 0;
    const issuedShares = basicInfo.issuedShares || 1;
    const shareCount50 = capitalPrevYen > 0 ? Math.floor(capitalPrevYen / 50) : issuedShares;

    const conversionRatio = issuedShares > 0 ? shareCount50 / issuedShares : 1;

    // Final Comparable Value
    const value = Math.floor(S_50_Raw * conversionRatio);

    return {
        value,
        S_50_Raw,
        ratios: {
            b, c, d,
            B, C, D,
            ratioB, ratioC, ratioD,
            avgRatio
        },
        conversion: {
            ratio: conversionRatio,
            shareCount50
        },
        multiplier,
        A
    };
}

// Deprecated or kept for reference? Can just alias to new one if needed, but easier to just use new one.
export function calculateSimilarIndustryMethodValue(
    A: number, B: number, C: number, D: number,
    b: number, c: number, d: number,
    multiplier: number
): number {
    // This old signature doesn't support conversion correctly without extra info.
    // It was just S_50_raw (floored) basically.
    // We should migrate away from this. For now, return what it used to return (A * ratio * multiplier).
    if (B === 0 || C === 0 || D === 0) return 0;
    const rB = b / B;
    const rC = c / C;
    const rD = d / D;
    const avgRatio = (rB + rC + rD) / 3;
    return Math.floor(A * avgRatio * multiplier);
}

/**
 * Calculates Own Company Financials (b, c, d) from raw inputs.
 * used in Step 3 and Simulations.
 *
 * NOTE: As per standard "Similar Industry Method", values are normalized to "50 yen par value" shares.
 * Divisor = (Capital at start of period / 50 yen).
 */
export function calculateOwnFinancials(
    data: {
        divPrev: number; div2Prev: number; div3Prev: number;
        p1: number; l1: number; p2: number; l2: number; p3: number; l3: number;
        cap1: number; re1: number; cap2: number; re2: number;
    },
    issuedShares: number // Kept for interface compatibility or fallback
) {
    // Calculate Share Count equivalent to 50 yen par value
    // cap1 is in Thousand Yen.
    const capitalPrevYen = data.cap1 * 1000;
    // Prevent division by zero if capital is missing (fallback to issuedShares though strictly should use capital)
    const shareCount50 = capitalPrevYen > 0 ? Math.floor(capitalPrevYen / 50) : issuedShares;

    const divisor = shareCount50;

    // 1. Dividends (b) - 2 Year Avg (Prev and 2Prev)
    const avgDivTotal = ((data.divPrev + data.div2Prev) * 1000) / 2;
    const rawOwnDividends = avgDivTotal / divisor;
    // Round down to 1 decimal place
    const ownDividends = Math.floor(rawOwnDividends * 10) / 10;

    // 2. Profit (c) - Comparison of Prev and 2-Year Avg
    const profitPrevAmount = (data.p1 + data.l1) * 1000;
    const profit2PrevAmount = (data.p2 + data.l2) * 1000;

    // Per Share Values (50 yen basis)
    const profitPerSharePrev = profitPrevAmount / divisor;

    const profitAvgAmount = (profitPrevAmount + profit2PrevAmount) / 2;
    const profitPerShareAvg = profitAvgAmount / divisor;

    // Use lower of the two, floored at 0, and round down to integer (yen)
    const ownProfit = Math.floor(Math.max(0, Math.min(profitPerSharePrev, profitPerShareAvg)));

    // Keep raw for reference (maybe avg of 3 still useful for logging? removing for now to avoid confusion)
    const profit3Prev = (data.p3 + data.l3) * 1000; // Still calculate for return obj consistency if needed

    // 3. Book Value (d) - Last Period Only
    // User correction: (Capital + Retained Earnings of Last Period) / 50y Share Count
    const netAssetPrev = (data.cap1 + data.re1) * 1000;
    // const netAsset2Prev = ... (No longer needed for 'd' calculation per user request)

    // Use Last Period Total
    const rawOwnBookValue = netAssetPrev / divisor;
    // Round down to integer
    const ownBookValue = Math.floor(rawOwnBookValue);

    return {
        ownDividends,
        ownProfit, // This is 'c' (per 50 yen)
        ownBookValue, // This is 'd' (per 50 yen)
        // Detailed profits for reference if needed
        profitPrev: profitPrevAmount, profit2Prev: profit2PrevAmount, profit3Prev
    };
}

/**
 * Calculates Final Valuation Result based on Size and Methods.
 * Used in Step 6 and Step 7.
 */
export function calculateFinalValuation(basicInfo: BasicInfo, financials: Financials) {
    const { assetsBookValue, liabilitiesBookValue } = financials;
    // Check for Inheritance Values (default to Book Value if not valid/present)
    const assetsInheritanceValue = financials.assetsInheritanceValue ?? assetsBookValue;
    const liabilitiesInheritanceValue = financials.liabilitiesInheritanceValue ?? liabilitiesBookValue;

    const { issuedShares, lRatio, size, sizeMultiplier } = basicInfo;

    // 1. Net Asset Value per Share (N)
    const netInh = assetsInheritanceValue - liabilitiesInheritanceValue;
    const netBook = assetsBookValue - liabilitiesBookValue;

    const evalDiff = netInh - netBook;
    const tax = evalDiff > 0 ? evalDiff * 0.37 : 0;

    const netAssetTotalAdjusted = netInh - tax;
    const netAssetPerShare = Math.max(0, netAssetTotalAdjusted / issuedShares);

    // 2. Comparable Company Value (S)
    const {
        industryStockPriceCurrent,
        industryStockPrice1MonthBefore,
        industryStockPrice2MonthsBefore,
        industryStockPricePrevYearAverage,
        industryDividends: B,
        industryProfit: C,
        industryBookValue: D,
        ownDividends: b,
        ownProfit: c,
        ownBookValue: d,
        ownCapitalPrev
    } = financials;

    const possibleAs = [
        industryStockPriceCurrent,
        industryStockPrice1MonthBefore,
        industryStockPrice2MonthsBefore,
        industryStockPricePrevYearAverage
    ].filter(n => n > 0);
    const A = possibleAs.length > 0 ? Math.min(...possibleAs) : 0;

    const multiplier = sizeMultiplier || 0.7; // default

    // Use Centralized Logic
    const simResult = calculateDetailedSimilarIndustryMethod(
        A, B, C, D,
        b, c, d,
        multiplier,
        basicInfo,
        ownCapitalPrev || 0
    );

    const comparableValue = simResult.value;

    // 3. Selection
    let finalValue = 0;
    let methodDescription = "";

    const S = comparableValue;
    const N = netAssetPerShare;
    const L = lRatio;

    // Additional info for comparison
    let comparisonDetails: { name: string; value: number }[] = [];

    if (size === "Big") {
        if (S < N) {
            finalValue = S;
            methodDescription = "類似業種比準価額 (原則)";
        } else {
            finalValue = N;
            methodDescription = "純資産価額 (選択)";
        }
        comparisonDetails = [
            { name: "類似業種比準価額", value: Math.floor(S) },
            { name: "純資産価額", value: Math.floor(N) }
        ];
    }
    else if (size === "Medium") {
        const blended = (S * L) + (N * (1 - L));
        if (blended < N) {
            finalValue = blended;
            methodDescription = `併用方式 (L=${L.toFixed(2)})`;
        } else {
            finalValue = N;
            methodDescription = "純資産価額 (選択)";
        }
        comparisonDetails = [
            { name: `併用方式 (S×${L}+N×${(1 - L).toFixed(2)})`, value: Math.floor(blended) },
            { name: "純資産価額", value: Math.floor(N) }
        ];
    }
    else { // Small
        const blended = (S * 0.50) + (N * 0.50);
        if (N < blended) {
            finalValue = N;
            methodDescription = "純資産価額 (原則)";
        } else {
            finalValue = blended;
            methodDescription = "併用方式 (L=0.50選択)";
        }
        comparisonDetails = [
            { name: "純資産価額", value: Math.floor(N) },
            { name: "併用方式 (L=0.50)", value: Math.floor(blended) }
        ];
    }

    return {
        finalValue: Math.floor(finalValue),
        netAssetPerShare: Math.round(N),
        comparableValue: Math.round(S),
        methodDescription,
        size,
        lRatio,
        comparisonDetails,
        netAssetDetail: {
            netInh, netBook, tax
        }
    };
}
