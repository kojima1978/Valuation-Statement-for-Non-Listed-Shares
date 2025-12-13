"use client";

import { useState } from "react";
import { BasicInfo, Financials } from "@/types/valuation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";

interface Step3Props {
    basicInfo: BasicInfo;
    onBack: () => void;
    onNext: (data: Partial<Financials>) => void;
    defaultValues?: Partial<Financials>;
}

export function Step3Comparable({ basicInfo, onBack, onNext, defaultValues }: Step3Props) {
    const [formData, setFormData] = useState({
        // Industry (A) - 4 Indicators
        industryStockPriceCurrent: defaultValues?.industryStockPriceCurrent?.toString() || "",
        industryStockPrice1MonthBefore: defaultValues?.industryStockPrice1MonthBefore?.toString() || "",
        industryStockPrice2MonthsBefore: defaultValues?.industryStockPrice2MonthsBefore?.toString() || "",
        industryStockPricePrevYearAverage: defaultValues?.industryStockPricePrevYearAverage?.toString() || "",

        // Industry (B, C, D)
        industryDividends: defaultValues?.industryDividends?.toString() || "",
        industryProfit: defaultValues?.industryProfit?.toString() || "",
        industryBookValue: defaultValues?.industryBookValue?.toString() || "",

        // Own Company Historical
        // Dividends
        ownDividendPrev: "",
        ownDividend2Prev: "",
        // Profit
        ownProfitPrev: "",
        ownProfit2Prev: "",
        // Book Value (d is usually just prev year)
        ownBookValuePrev: "",
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

        const industryDividends = Number(formData.industryDividends);
        const industryProfit = Number(formData.industryProfit);
        const industryBookValue = Number(formData.industryBookValue);

        // Calculate Averages for Own Company
        const divPrev = Number(formData.ownDividendPrev);
        const div2Prev = Number(formData.ownDividend2Prev);
        // b = Average of last 2 years (simplified rule)
        const ownDividends = (divPrev + div2Prev) / 2;

        const profitPrev = Number(formData.ownProfitPrev);
        const profit2Prev = Number(formData.ownProfit2Prev);
        const ownProfit = (profitPrev + profit2Prev) / 2;

        const ownBookValue = Number(formData.ownBookValuePrev);

        onNext({
            industryStockPriceCurrent,
            industryStockPrice1MonthBefore,
            industryStockPrice2MonthsBefore,
            industryStockPricePrevYearAverage,
            industryDividends,
            industryProfit,
            industryBookValue,
            ownDividends,
            ownProfit,
            ownBookValue,
        });
    };

    // Helper to calculate Min Stock Price for display
    const calculateMinStockPrice = () => {
        const v1 = Number(formData.industryStockPriceCurrent);
        const v2 = Number(formData.industryStockPrice1MonthBefore);
        const v3 = Number(formData.industryStockPrice2MonthsBefore);
        const v4 = Number(formData.industryStockPricePrevYearAverage);

        // Filter out 0/empty if desired, but here we assume user inputs all if they want correct min.
        // Actually, if some are 0, they might be "lowest". 
        // User instruction: lowest of the 4.
        // We will just do Math.min of values. If 0, it is 0. 
        // Or if empty string? Number("") is 0.
        // Let's just standard comparison.
        const values = [v1, v2, v3, v4].filter(v => v > 0); // Filter > 0 for realistic min? Or includes 0? Stock price usually > 0.
        if (values.length === 0) return 0;
        return Math.min(...values);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-primary">類似業種比準価額の入力 (Step 3/5)</h2>
                <p className="text-muted-foreground">類似業種のデータと自社の比準要素を入力します。</p>
            </div>

            <Card className="p-6 border-secondary/20 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Comparable Company Data */}
                    <div className="space-y-4">
                        <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                            <Label className="text-primary font-black">類似業種のデータ (国税庁公表値)</Label>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>A: 株価 (4つの指標から最低値を採用)</Label>
                                    {calculateMinStockPrice() > 0 && (
                                        <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                            採用株価: {calculateMinStockPrice().toLocaleString()}円
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <Label htmlFor="industryStockPriceCurrent" className="text-xs text-muted-foreground">課税時期の月</Label>
                                        <NumberInput
                                            id="industryStockPriceCurrent"
                                            name="industryStockPriceCurrent"
                                            placeholder="0"
                                            value={formData.industryStockPriceCurrent}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="industryStockPrice1MonthBefore" className="text-xs text-muted-foreground">前月</Label>
                                        <NumberInput
                                            id="industryStockPrice1MonthBefore"
                                            name="industryStockPrice1MonthBefore"
                                            placeholder="0"
                                            value={formData.industryStockPrice1MonthBefore}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="industryStockPrice2MonthsBefore" className="text-xs text-muted-foreground">前々月</Label>
                                        <NumberInput
                                            id="industryStockPrice2MonthsBefore"
                                            name="industryStockPrice2MonthsBefore"
                                            placeholder="0"
                                            value={formData.industryStockPrice2MonthsBefore}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="industryStockPricePrevYearAverage" className="text-xs text-muted-foreground">前年平均</Label>
                                        <NumberInput
                                            id="industryStockPricePrevYearAverage"
                                            name="industryStockPricePrevYearAverage"
                                            placeholder="0"
                                            value={formData.industryStockPricePrevYearAverage}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="industryDividends">B: 配当</Label>
                                    <NumberInput
                                        id="industryDividends"
                                        name="industryDividends"
                                        placeholder="0"
                                        value={formData.industryDividends}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="industryProfit">C: 利益</Label>
                                    <NumberInput
                                        id="industryProfit"
                                        name="industryProfit"
                                        placeholder="0"
                                        value={formData.industryProfit}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="industryBookValue">D: 純資産</Label>
                                    <NumberInput
                                        id="industryBookValue"
                                        name="industryBookValue"
                                        placeholder="0"
                                        value={formData.industryBookValue}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-primary font-black">自社の実績データ (平均値計算)</Label>

                            {/* Dividends */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>1株あたり配当金額 (b)</Label>
                                    <div className="flex gap-2">
                                        <NumberInput
                                            name="ownDividendPrev"
                                            placeholder="直前期"
                                            onChange={handleChange}
                                            value={formData.ownDividendPrev}
                                        />
                                        <NumberInput
                                            name="ownDividend2Prev"
                                            placeholder="直前々期"
                                            onChange={handleChange}
                                            value={formData.ownDividend2Prev}
                                        />
                                    </div>
                                </div>

                                {/* Profit */}
                                <div className="space-y-2">
                                    <Label>1株あたり利益金額 (c)</Label>
                                    <div className="flex gap-2">
                                        <NumberInput
                                            name="ownProfitPrev"
                                            placeholder="直前期"
                                            onChange={handleChange}
                                            value={formData.ownProfitPrev}
                                        />
                                        <NumberInput
                                            name="ownProfit2Prev"
                                            placeholder="直前々期"
                                            onChange={handleChange}
                                            value={formData.ownProfit2Prev}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Book Value */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>1株あたり純資産価額 (d)</Label>
                                    <NumberInput
                                        name="ownBookValuePrev"
                                        placeholder="直前期末"
                                        onChange={handleChange}
                                        value={formData.ownBookValuePrev}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
                            戻る
                        </Button>
                        <Button type="submit" size="lg" className="flex-[2] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            次へ (Step 4へ)
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
