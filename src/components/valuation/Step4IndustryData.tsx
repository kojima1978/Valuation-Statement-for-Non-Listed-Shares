"use client";

import { useState } from "react";
import { BasicInfo, Financials } from "@/types/valuation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";

import { calculateDetailedSimilarIndustryMethod } from "@/lib/valuation-logic";

interface Step4Props {
    basicInfo: BasicInfo;
    onBack: () => void;
    onNext: (data: Partial<Financials>) => void;
    defaultValues?: Partial<Financials>;
}

export function Step4IndustryData({ basicInfo, onBack, onNext, defaultValues }: Step4Props) {
    // Initializer to split dividend into yen and sen if it exists
    const initDiv = defaultValues?.industryDividends || 0;
    const initDivYen = Math.floor(initDiv);
    const initDivSen = Math.round((initDiv - initDivYen) * 10); // 1 decimal place

    const [formData, setFormData] = useState({
        // Industry (A) - 4 Indicators
        industryStockPriceCurrent: defaultValues?.industryStockPriceCurrent?.toString() || "",
        industryStockPrice1MonthBefore: defaultValues?.industryStockPrice1MonthBefore?.toString() || "",
        industryStockPrice2MonthsBefore: defaultValues?.industryStockPrice2MonthsBefore?.toString() || "",
        industryStockPricePrevYearAverage: defaultValues?.industryStockPricePrevYearAverage?.toString() || "",

        // Industry (B) - Split into Yen and Sen (1 decimal place)
        industryDividendsYen: initDiv > 0 ? initDivYen.toString() : "",
        industryDividendsSen: initDiv > 0 ? initDivSen.toString() : "",

        // Industry (C, D)
        industryProfit: defaultValues?.industryProfit?.toString() || "",
        industryBookValue: defaultValues?.industryBookValue?.toString() || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Parse Inputs
        const industryStockPriceCurrent = Number(formData.industryStockPriceCurrent);
        const industryStockPrice1MonthBefore = Number(formData.industryStockPrice1MonthBefore);
        const industryStockPrice2MonthsBefore = Number(formData.industryStockPrice2MonthsBefore);
        const industryStockPricePrevYearAverage = Number(formData.industryStockPricePrevYearAverage);

        // Combine Dividend Yen and Sen
        const divYen = Number(formData.industryDividendsYen);
        const divSen = Number(formData.industryDividendsSen);
        // Treat Sen as 1st decimal place (0-9)
        const industryDividends = divYen + (divSen * 0.1);

        const industryProfit = Number(formData.industryProfit);
        const industryBookValue = Number(formData.industryBookValue);

        onNext({
            industryStockPriceCurrent,
            industryStockPrice1MonthBefore,
            industryStockPrice2MonthsBefore,
            industryStockPricePrevYearAverage,
            industryDividends,
            industryProfit,
            industryBookValue,
        });
    };

    // Helper to calculate Min Stock Price for display (A)
    const calculateMinStockPrice = () => {
        const v1 = Number(formData.industryStockPriceCurrent);
        const v2 = Number(formData.industryStockPrice1MonthBefore);
        const v3 = Number(formData.industryStockPrice2MonthsBefore);
        const v4 = Number(formData.industryStockPricePrevYearAverage);

        const values = [v1, v2, v3, v4].filter(v => v > 0);
        if (values.length === 0) return 0;
        return Math.min(...values);
    };

    // Real-time Valuation Logic with Details
    const calculateValuationDetails = () => {
        const A = calculateMinStockPrice();
        if (A === 0) return null;

        // Industry Data (B, C, D)
        const divYen = Number(formData.industryDividendsYen);
        const divSen = Number(formData.industryDividendsSen);
        const B_ind = divYen + (divSen * 0.1);
        const C_ind = Number(formData.industryProfit);
        const D_ind = Number(formData.industryBookValue);

        if (B_ind === 0 || C_ind === 0 || D_ind === 0) return null;

        // Own Data (b, c, d) - from defaultValues
        const b_own = defaultValues?.ownDividends || 0;
        const c_own = defaultValues?.ownProfit || 0;
        const d_own = defaultValues?.ownBookValue || 0;

        // Multiplier based on Size (Step 2)
        // Use basicInfo.sizeMultiplier explicitly if available, otherwise fallback
        let multiplier = 0.7;
        if (basicInfo.sizeMultiplier) {
            multiplier = basicInfo.sizeMultiplier;
        } else {
            // Fallback logic if basicInfo not fully updated (should not happen with new flow)
            if (basicInfo.size === "Medium") multiplier = 0.6;
            if (basicInfo.size === "Small") multiplier = 0.5;
        }

        // Use centralized logic from valuation-logic.ts
        const result = calculateDetailedSimilarIndustryMethod(
            A,
            B_ind, C_ind, D_ind,
            b_own, c_own, d_own,
            multiplier,
            basicInfo
        );

        return result;
    };

    const details = calculateValuationDetails();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-primary">類似業種データの入力 (Step 4/6)</h2>
                <p className="text-muted-foreground">国税庁公表の類似業種比準価額算定上の数値を入力します。</p>
            </div>

            <Card className="p-6 border-secondary/20 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Comparable Company Data */}
                    <div className="space-y-4">
                        <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-dashed">
                                <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">4</div>
                                <h3 className="text-lg font-bold">同業者のデータ (国税庁公表値)</h3>
                            </div>

                            {/* A: Stock Price */}
                            <div className="space-y-2 bg-primary/5 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <Label>A: 株価</Label>
                                    {calculateMinStockPrice() > 0 && (
                                        <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                            採用株価: {calculateMinStockPrice().toLocaleString()}円
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <Label htmlFor="industryStockPriceCurrent" className="text-xs text-muted-foreground">課税時期の月</Label>
                                        <div className="relative">
                                            <NumberInput
                                                id="industryStockPriceCurrent"
                                                name="industryStockPriceCurrent"
                                                placeholder="0"
                                                value={formData.industryStockPriceCurrent}
                                                onChange={handleChange}
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="industryStockPrice1MonthBefore" className="text-xs text-muted-foreground">前月</Label>
                                        <div className="relative">
                                            <NumberInput
                                                id="industryStockPrice1MonthBefore"
                                                name="industryStockPrice1MonthBefore"
                                                placeholder="0"
                                                value={formData.industryStockPrice1MonthBefore}
                                                onChange={handleChange}
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="industryStockPrice2MonthsBefore" className="text-xs text-muted-foreground">前々月</Label>
                                        <div className="relative">
                                            <NumberInput
                                                id="industryStockPrice2MonthsBefore"
                                                name="industryStockPrice2MonthsBefore"
                                                placeholder="0"
                                                value={formData.industryStockPrice2MonthsBefore}
                                                onChange={handleChange}
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="industryStockPricePrevYearAverage" className="text-xs text-muted-foreground">前年平均</Label>
                                        <div className="relative">
                                            <NumberInput
                                                id="industryStockPricePrevYearAverage"
                                                name="industryStockPricePrevYearAverage"
                                                placeholder="0"
                                                value={formData.industryStockPricePrevYearAverage}
                                                onChange={handleChange}
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2 bg-primary/5 p-4 rounded-lg">
                                    <Label>B: 配当</Label>
                                    <div className="flex gap-2 items-center">
                                        <div className="relative flex-1">
                                            <NumberInput
                                                name="industryDividendsYen"
                                                placeholder="0"
                                                value={formData.industryDividendsYen}
                                                onChange={handleChange}
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
                                        </div>
                                        <div className="relative w-24">
                                            <NumberInput
                                                name="industryDividendsSen"
                                                placeholder="0"
                                                value={formData.industryDividendsSen}
                                                onChange={handleChange}
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">銭</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 bg-primary/5 p-4 rounded-lg">
                                    <Label htmlFor="industryProfit">C: 利益</Label>
                                    <div className="relative">
                                        <NumberInput
                                            id="industryProfit"
                                            name="industryProfit"
                                            placeholder="0"
                                            value={formData.industryProfit}
                                            onChange={handleChange}
                                            className="pr-8 text-right bg-white"
                                        />
                                        <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
                                    </div>
                                </div>
                                <div className="space-y-2 bg-primary/5 p-4 rounded-lg">
                                    <Label htmlFor="industryBookValue">D: 純資産</Label>
                                    <div className="relative">
                                        <NumberInput
                                            id="industryBookValue"
                                            name="industryBookValue"
                                            placeholder="0"
                                            value={formData.industryBookValue}
                                            onChange={handleChange}
                                            className="pr-8 text-right bg-white"
                                        />
                                        <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Real-time Result Preview */}
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                        <h3 className="text-sm font-bold text-muted-foreground mb-4 border-b border-primary/10 pb-2">比準価額の計算結果 (リアルタイムプレビュー)</h3>

                        {details ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">

                                    <div className="bg-white/50 p-2 rounded relative overflow-hidden">
                                        <div className="text-muted-foreground">配当比準 (b/B)</div>
                                        <div className="font-bold flex items-center justify-center gap-1">
                                            {details.ratios.b.toFixed(1)} / {details.ratios.B.toFixed(1)} = {details.ratios.ratioB.toFixed(2)}
                                            {details.ratios.ratioB > 1 && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 animate-pulse">
                                                    <path d="m5 12 7-7 7 7" />
                                                    <path d="M12 19V5" />
                                                </svg>
                                            )}
                                            {details.ratios.ratioB < 1 && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 animate-pulse">
                                                    <path d="M12 5v14" />
                                                    <path d="m19 12-7 7-7-7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded relative overflow-hidden">
                                        <div className="text-muted-foreground">利益比準 (c/C)</div>
                                        <div className="font-bold flex items-center justify-center gap-1">
                                            {details.ratios.c.toFixed(0)} / {details.ratios.C.toFixed(0)} = {details.ratios.ratioC.toFixed(2)}
                                            {details.ratios.ratioC > 1 && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 animate-pulse">
                                                    <path d="m5 12 7-7 7 7" />
                                                    <path d="M12 19V5" />
                                                </svg>
                                            )}
                                            {details.ratios.ratioC < 1 && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 animate-pulse">
                                                    <path d="M12 5v14" />
                                                    <path d="m19 12-7 7-7-7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded relative overflow-hidden">
                                        <div className="text-muted-foreground">純資産比準 (d/D)</div>
                                        <div className="font-bold flex items-center justify-center gap-1">
                                            {details.ratios.d.toFixed(0)} / {details.ratios.D.toFixed(0)} = {details.ratios.ratioD.toFixed(2)}
                                            {details.ratios.ratioD > 1 && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 animate-pulse">
                                                    <path d="m5 12 7-7 7 7" />
                                                    <path d="M12 19V5" />
                                                </svg>
                                            )}
                                            {details.ratios.ratioD < 1 && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 animate-pulse">
                                                    <path d="M12 5v14" />
                                                    <path d="m19 12-7 7-7-7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center text-xs text-muted-foreground gap-2">
                                    <span>比準割合: {details.ratios.avgRatio.toFixed(2)}</span>
                                </div>

                                {/* 会社規模に応じた斟酌率の表示 */}
                                <div className="mt-3 mb-2 p-3 bg-white/50 rounded-lg border border-primary/10">
                                    <div className="text-xs font-semibold text-muted-foreground mb-2 text-center">会社規模に応じた斟酌率</div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className={`p-2 rounded text-center transition-all ${basicInfo.size === 'Big' ? 'bg-primary/20 text-primary font-semibold border border-primary/30' : 'bg-white/30 text-gray-400 border border-gray-200'}`}>
                                            <div className="font-normal text-xs">大会社</div>
                                            <div className="mt-1">0.7</div>
                                        </div>
                                        <div className={`p-2 rounded text-center transition-all ${basicInfo.size === 'Medium' ? 'bg-primary/20 text-primary font-semibold border border-primary/30' : 'bg-white/30 text-gray-400 border border-gray-200'}`}>
                                            <div className="font-normal text-xs">中会社</div>
                                            <div className="mt-1">0.6</div>
                                        </div>
                                        <div className={`p-2 rounded text-center transition-all ${basicInfo.size === 'Small' ? 'bg-primary/20 text-primary font-semibold border border-primary/30' : 'bg-white/30 text-gray-400 border border-gray-200'}`}>
                                            <div className="font-normal text-xs">小会社</div>
                                            <div className="mt-1">0.5</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 原株換算 */}
                                <div className="mb-2 p-3 bg-white/50 rounded-lg border border-primary/10">
                                    <div className="text-xs font-semibold text-muted-foreground mb-2 text-center">原株換算</div>
                                    <div className="flex items-center justify-center gap-2 text-xs">
                                        <span className="text-black">1株当たりの資本金額</span>
                                        <span className="font-bold text-black">
                                            {(((basicInfo.capital || 0) * 1000) / (basicInfo.issuedShares || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}円
                                        </span>
                                        <span className="text-black">/</span>
                                        <span className="font-bold text-black">50円</span>
                                        <span className="text-black">=</span>
                                        <span className="font-bold text-black">
                                            {details.conversion.ratio.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-primary/20 pt-2">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">類似業種比準価額</p>
                                        <p className="text-xs text-muted-foreground">
                                            {details.A.toLocaleString()}(株価) × {details.ratios.avgRatio.toFixed(2)}(比準割合) × {details.multiplier}(斟酌率) × {details.conversion.ratio.toLocaleString(undefined, { maximumFractionDigits: 3 })}(原株換算)
                                        </p>
                                    </div>
                                    <p className="text-2xl font-black text-primary">
                                        {details.value.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">円</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-sm text-muted-foreground py-4">
                                必要な数値を全て入力すると計算結果が表示されます
                            </div>
                        )}
                    </div>
                    {/* ... */}

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
                            戻る
                        </Button>
                        <Button type="submit" size="lg" className="flex-[2] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            次へ進む
                        </Button>
                    </div>
                </form>
            </Card >
        </div >
    );
}
