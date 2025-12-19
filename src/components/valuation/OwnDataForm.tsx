"use client";

import { useState } from "react";
import { BasicInfo, Financials } from "@/types/valuation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";

interface OwnDataFormProps {
    basicInfo: BasicInfo | Partial<BasicInfo>;
    onBack: () => void;
    onNext: (data: Partial<Financials>) => void;
    defaultValues?: Partial<Financials>;
}

export function OwnDataForm({ basicInfo, onBack, onNext, defaultValues }: OwnDataFormProps) {
    const isMedicalCorporation = basicInfo.industryType === "MedicalCorporation";

    const [profitMethodC, setProfitMethodC] = useState<"auto" | "c1" | "c2">(defaultValues?.profitMethodC || "auto");
    const [profitMethodC1, setProfitMethodC1] = useState<"auto" | "c1" | "c2">(defaultValues?.profitMethodC1 || "auto");
    const [profitMethodC2, setProfitMethodC2] = useState<"auto" | "c1" | "c2">(defaultValues?.profitMethodC2 || "auto");
    const [formData, setFormData] = useState({
        // Dividends (Total Amount in Thousand Yen)
        ownDividendPrev: isMedicalCorporation ? "0" : (defaultValues?.ownDividendPrev?.toString() || ""),
        ownDividend2Prev: isMedicalCorporation ? "0" : (defaultValues?.ownDividend2Prev?.toString() || ""),
        ownDividend3Prev: isMedicalCorporation ? "0" : (defaultValues?.ownDividend3Prev?.toString() || ""),

        // Profit Components (Total Amount in Thousand Yen)
        ownTaxableIncomePrev: defaultValues?.ownTaxableIncomePrev?.toString() || "",
        ownCarryForwardLossPrev: defaultValues?.ownCarryForwardLossPrev?.toString() || "",
        ownTaxableIncome2Prev: defaultValues?.ownTaxableIncome2Prev?.toString() || "",
        ownCarryForwardLoss2Prev: defaultValues?.ownCarryForwardLoss2Prev?.toString() || "",
        ownTaxableIncome3Prev: defaultValues?.ownTaxableIncome3Prev?.toString() || "",
        ownCarryForwardLoss3Prev: defaultValues?.ownCarryForwardLoss3Prev?.toString() || "",

        // Book Value Components (Total Amount in Thousand Yen)
        // Capital
        ownCapitalPrev: defaultValues?.ownCapitalPrev?.toString() || "",
        ownCapital2Prev: defaultValues?.ownCapital2Prev?.toString() || "",
        // Retained Earnings
        ownRetainedEarningsPrev: defaultValues?.ownRetainedEarningsPrev?.toString() || "",
        ownRetainedEarnings2Prev: defaultValues?.ownRetainedEarnings2Prev?.toString() || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const issuedShares = basicInfo.issuedShares || 1;
        // Calculate 50-yen share count
        // Priority: Step 3 Input (ownCapitalPrev) > Step 1 Input (basicInfo.capital)
        const capPrev = Number(formData.ownCapitalPrev) > 0 ? Number(formData.ownCapitalPrev) : (basicInfo.capital || 0);
        const shareCount50 = (capPrev * 1000) > 0 ? Math.floor((capPrev * 1000) / 50) : issuedShares;

        // 1. Dividends (b) - 2 Year Avg (Prev + 2Prev) / 2
        const divPrev = Number(formData.ownDividendPrev);
        const div2Prev = Number(formData.ownDividend2Prev);
        const div3Prev = Number(formData.ownDividend3Prev);

        const avgDivTotal = ((divPrev + div2Prev) * 1000) / 2;
        const rawOwnDividends = avgDivTotal / shareCount50;
        const ownDividends = Math.floor(rawOwnDividends * 10) / 10;

        // 2. Profit (c) - Min(Prev, Avg(Prev, 2Prev))
        const p1 = Number(formData.ownTaxableIncomePrev);
        const l1 = Number(formData.ownCarryForwardLossPrev);
        const p2 = Number(formData.ownTaxableIncome2Prev);
        const l2 = Number(formData.ownCarryForwardLoss2Prev);
        const p3 = Number(formData.ownTaxableIncome3Prev);
        const l3 = Number(formData.ownCarryForwardLoss3Prev);

        const profitPrevAmount = (p1 + l1) * 1000;
        const profit2PrevAmount = (p2 + l2) * 1000;
        const profit3PrevAmount = (p3 + l3) * 1000;

        const profitPerSharePrev = profitPrevAmount / shareCount50;
        const profitPerShareAvg = ((profitPrevAmount + profit2PrevAmount) / 2) / shareCount50;

        // Calculate individual profit values (整数に切り捨て)
        // For c1 selection
        const profitC1Single = Math.floor(Math.max(0, profitPerSharePrev)); // c1の「直前」: 直前期
        const profitC1Avg = Math.floor(Math.max(0, profitPerShareAvg)); // c1の「2年平均」: 直前期と2期前の平均

        // For c2 selection
        const profitC2Single = Math.floor(Math.max(0, profit2PrevAmount / shareCount50)); // c2の「直前」: 2期前
        const profitC2Avg = Math.floor(Math.max(0, ((profit2PrevAmount + profit3PrevAmount) / 2) / shareCount50)); // c2の「2年平均」: 2期前と3期前の平均

        // c: Main profit value based on selection
        let ownProfit: number;
        if (profitMethodC === "c1") {
            ownProfit = profitC1Single;
        } else if (profitMethodC === "c2") {
            ownProfit = profitC1Avg;
        } else {
            // auto: 最も低い値を自動選択
            ownProfit = Math.floor(Math.max(0, Math.min(profitPerSharePrev, profitPerShareAvg)));
        }

        // 3. Book Value (d) - Last Period Only (Capital + Retained Earnings)
        const cap1 = Number(formData.ownCapitalPrev);
        const re1 = Number(formData.ownRetainedEarningsPrev);
        const cap2 = Number(formData.ownCapital2Prev);
        const re2 = Number(formData.ownRetainedEarnings2Prev);

        const netAssetPrev = (cap1 + re1) * 1000;

        const rawOwnBookValue = netAssetPrev / shareCount50;
        const ownBookValue = Math.floor(rawOwnBookValue);

        // Additional calculations for b1, b2, c1, c2, d1, d2
        // b1: (直前期 + 2期前) ÷ 2 (same as ownDividends)
        const ownDividendsB1 = ownDividends;

        // b2: (2期前 + 3期前) ÷ 2
        const avgDivTotalB2 = ((div2Prev + div3Prev) * 1000) / 2;
        const rawOwnDividendsB2 = avgDivTotalB2 / shareCount50;
        const ownDividendsB2 = Math.floor(rawOwnDividendsB2 * 10) / 10;

        // c1: Based on user selection
        let ownProfitC1: number;
        if (profitMethodC1 === "c1") {
            ownProfitC1 = profitC1Single; // 直前期
        } else if (profitMethodC1 === "c2") {
            ownProfitC1 = profitC1Avg; // 直前期と2期前の平均
        } else {
            // auto: 直前期と2年平均の少ない方
            ownProfitC1 = Math.min(profitC1Single, profitC1Avg);
        }

        // c2: Based on user selection
        let ownProfitC2: number;
        if (profitMethodC2 === "c1") {
            ownProfitC2 = profitC2Single; // 2期前
        } else if (profitMethodC2 === "c2") {
            ownProfitC2 = profitC2Avg; // 2期前と3期前の平均
        } else {
            // auto: 2期前と2期前+3期前平均の少ない方
            ownProfitC2 = Math.min(profitC2Single, profitC2Avg);
        }

        // d1: 直前期の純資産価額 (same as ownBookValue)
        const ownBookValueD1 = ownBookValue;

        // d2: 2期前の純資産価額
        const netAsset2Prev = (cap2 + re2) * 1000;
        const rawOwnBookValueD2 = netAsset2Prev / shareCount50;
        const ownBookValueD2 = Math.floor(rawOwnBookValueD2);

        // 評価方法の判定（優先順位: 比準要素数0 → 比準要素数1 → 一般）

        // 比準要素数0の会社の判定: b1, c1, d1 がすべて0の場合
        const isZeroElementCompany = ownDividendsB1 === 0 && ownProfitC1 === 0 && ownBookValueD1 === 0;

        // 比準要素数1の会社の判定（比準要素数0に該当しない場合のみ判定）
        // 条件: b1, c1, d1のいずれか2つが「0」 かつ b2, c2, d2の2以上が「0」
        const countZeroInB1C1D1 = [ownDividendsB1, ownProfitC1, ownBookValueD1].filter(v => v === 0).length;
        const countZeroInB2C2D2 = [ownDividendsB2, ownProfitC2, ownBookValueD2].filter(v => v === 0).length;
        const isOneElementCompany = !isZeroElementCompany && (countZeroInB1C1D1 >= 2 && countZeroInB2C2D2 >= 2);

        // 一般の評価会社: 比準要素数0にも比準要素数1にも該当しない場合（自動判定）
        const isGeneralCompany = !isZeroElementCompany && !isOneElementCompany;

        onNext({
            // Results
            ownDividends,
            ownProfit,
            ownBookValue,
            // Additional Results (b1, b2, c1, c2, d1, d2)
            ownDividendsB1,
            ownDividendsB2,
            ownProfitC1,
            ownProfitC2,
            ownBookValueD1,
            ownBookValueD2,
            // Special classification
            isZeroElementCompany,
            isOneElementCompany,
            // Profit calculation method selections
            profitMethodC,
            profitMethodC1,
            profitMethodC2,
            // Raw Data for Persistence
            ownDividendPrev: divPrev,
            ownDividend2Prev: div2Prev,
            ownDividend3Prev: div3Prev,
            ownTaxableIncomePrev: p1,
            ownCarryForwardLossPrev: l1,
            ownTaxableIncome2Prev: p2,
            ownCarryForwardLoss2Prev: l2,
            ownTaxableIncome3Prev: p3,
            ownCarryForwardLoss3Prev: l3,
            ownCapitalPrev: cap1,
            ownRetainedEarningsPrev: re1,
            ownCapital2Prev: cap2,
            ownRetainedEarnings2Prev: re2,
        });
    };

    const handleCopyFromPrev = () => {
        setFormData((prev) => ({
            ...prev,
            // Dividends (医療法人の場合は0)
            ownDividend2Prev: isMedicalCorporation ? "0" : prev.ownDividendPrev,
            ownDividend3Prev: isMedicalCorporation ? "0" : prev.ownDividendPrev,
            // Taxable Income
            ownTaxableIncome2Prev: prev.ownTaxableIncomePrev,
            ownTaxableIncome3Prev: prev.ownTaxableIncomePrev,
            // Carry Forward Loss
            ownCarryForwardLoss2Prev: prev.ownCarryForwardLossPrev,
            ownCarryForwardLoss3Prev: prev.ownCarryForwardLossPrev,
            // Capital
            ownCapital2Prev: prev.ownCapitalPrev,
            // Retained Earnings
            ownRetainedEarnings2Prev: prev.ownRetainedEarningsPrev,
        }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-primary">自社の実績データ入力 (Step 3/8)</h2>
                <p className="text-muted-foreground">自社の配当と、利益、純資産を入力してください。</p>
            </div>

            <Card className="p-6 border-secondary/20 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-blue-300 bg-blue-50 p-4 rounded-t-lg border-2 border-b-0 border-blue-200">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">✎</div>
                                <h3 className="text-lg font-bold text-blue-900">入力：自社のデータ</h3>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleCopyFromPrev}
                                className="text-xs"
                            >
                                直前期データを複写
                            </Button>
                        </div>


                        {/* Dividends */}
                        <div className="space-y-2 bg-blue-50 p-4 rounded-lg border-2 border-blue-200 border-t-0">
                            <div className="flex items-center justify-between">
                                <Label>配当金額 (b)</Label>
                                {isMedicalCorporation && (
                                    <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                        医療法人は配当不可のため0円固定
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">直前期</Label>
                                    <div className="relative">
                                        <NumberInput
                                            name="ownDividendPrev"
                                            placeholder="0"
                                            onChange={handleChange}
                                            value={formData.ownDividendPrev}
                                            required
                                            disabled={isMedicalCorporation}
                                            className={`pr-8 text-right ${isMedicalCorporation ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                        />
                                        <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">2期前</Label>
                                    <div className="relative">
                                        <NumberInput
                                            name="ownDividend2Prev"
                                            placeholder="0"
                                            onChange={handleChange}
                                            value={formData.ownDividend2Prev}
                                            required
                                            disabled={isMedicalCorporation}
                                            className={`pr-8 text-right ${isMedicalCorporation ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                        />
                                        <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">3期前</Label>
                                    <div className="relative">
                                        <NumberInput
                                            name="ownDividend3Prev"
                                            placeholder="0"
                                            onChange={handleChange}
                                            value={formData.ownDividend3Prev}
                                            required
                                            disabled={isMedicalCorporation}
                                            className={`pr-8 text-right ${isMedicalCorporation ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                        />
                                        <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profit */}
                        <div className="space-y-3 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                            <Label>利益金額 (c)</Label>

                            {/* Selection for c */}
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground min-w-[60px]">c の選択:</span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setProfitMethodC("auto")}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                            profitMethodC === "auto"
                                                ? "bg-primary text-white"
                                                : "bg-white text-muted-foreground hover:bg-primary/10"
                                        }`}
                                    >
                                        自動
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProfitMethodC("c1")}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                            profitMethodC === "c1"
                                                ? "bg-primary text-white"
                                                : "bg-white text-muted-foreground hover:bg-primary/10"
                                        }`}
                                    >
                                        直前
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProfitMethodC("c2")}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                            profitMethodC === "c2"
                                                ? "bg-primary text-white"
                                                : "bg-white text-muted-foreground hover:bg-primary/10"
                                        }`}
                                    >
                                        2年平均
                                    </button>
                                </div>
                            </div>

                            {/* Selection for c1 */}
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground min-w-[60px]">c1 の選択:</span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setProfitMethodC1("auto")}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                            profitMethodC1 === "auto"
                                                ? "bg-green-600 text-white"
                                                : "bg-white text-muted-foreground hover:bg-green-100"
                                        }`}
                                    >
                                        自動
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProfitMethodC1("c1")}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                            profitMethodC1 === "c1"
                                                ? "bg-green-600 text-white"
                                                : "bg-white text-muted-foreground hover:bg-green-100"
                                        }`}
                                    >
                                        直前
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProfitMethodC1("c2")}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                            profitMethodC1 === "c2"
                                                ? "bg-green-600 text-white"
                                                : "bg-white text-muted-foreground hover:bg-green-100"
                                        }`}
                                    >
                                        2年平均
                                    </button>
                                </div>
                            </div>

                            {/* Selection for c2 */}
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground min-w-[60px]">c2 の選択:</span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setProfitMethodC2("auto")}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                            profitMethodC2 === "auto"
                                                ? "bg-green-600 text-white"
                                                : "bg-white text-muted-foreground hover:bg-green-100"
                                        }`}
                                    >
                                        自動
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProfitMethodC2("c1")}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                            profitMethodC2 === "c1"
                                                ? "bg-green-600 text-white"
                                                : "bg-white text-muted-foreground hover:bg-green-100"
                                        }`}
                                    >
                                        直前
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProfitMethodC2("c2")}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                            profitMethodC2 === "c2"
                                                ? "bg-green-600 text-white"
                                                : "bg-white text-muted-foreground hover:bg-green-100"
                                        }`}
                                    >
                                        2年平均
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {/* Last Year */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-center block">直前期</Label>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">利益</Label>
                                        <div className="relative">
                                            <NumberInput
                                                name="ownTaxableIncomePrev"
                                                placeholder="0"
                                                onChange={handleChange}
                                                value={formData.ownTaxableIncomePrev}
                                                required
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">繰越欠損金の控除額</Label>
                                        <div className="relative">
                                            <NumberInput
                                                name="ownCarryForwardLossPrev"
                                                placeholder="0"
                                                onChange={handleChange}
                                                value={formData.ownCarryForwardLossPrev}
                                                required
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2 Years Ago */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-center block">2期前</Label>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">利益</Label>
                                        <div className="relative">
                                            <NumberInput
                                                name="ownTaxableIncome2Prev"
                                                placeholder="0"
                                                onChange={handleChange}
                                                value={formData.ownTaxableIncome2Prev}
                                                required
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">繰越欠損金の控除額</Label>
                                        <div className="relative">
                                            <NumberInput
                                                name="ownCarryForwardLoss2Prev"
                                                placeholder="0"
                                                onChange={handleChange}
                                                value={formData.ownCarryForwardLoss2Prev}
                                                required
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3 Years Ago */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-center block">3期前</Label>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">利益</Label>
                                        <div className="relative">
                                            <NumberInput
                                                name="ownTaxableIncome3Prev"
                                                placeholder="0"
                                                onChange={handleChange}
                                                value={formData.ownTaxableIncome3Prev}
                                                required
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">繰越欠損金の控除額</Label>
                                        <div className="relative">
                                            <NumberInput
                                                name="ownCarryForwardLoss3Prev"
                                                placeholder="0"
                                                onChange={handleChange}
                                                value={formData.ownCarryForwardLoss3Prev}
                                                required
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Book Value */}
                        <div className="space-y-2 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                            <Label>純資産価額 (d)</Label>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Last Year */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-center block">直前期</Label>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">資本金</Label>
                                        <div className="relative">
                                            <NumberInput
                                                name="ownCapitalPrev"
                                                placeholder="0"
                                                onChange={handleChange}
                                                value={formData.ownCapitalPrev}
                                                required
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">繰越利益剰余金</Label>
                                        <div className="relative">
                                            <NumberInput
                                                name="ownRetainedEarningsPrev"
                                                placeholder="0"
                                                onChange={handleChange}
                                                value={formData.ownRetainedEarningsPrev}
                                                required
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2 Years Ago */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-center block">2期前</Label>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">資本金</Label>
                                        <div className="relative">
                                            <NumberInput
                                                name="ownCapital2Prev"
                                                placeholder="0"
                                                onChange={handleChange}
                                                value={formData.ownCapital2Prev}
                                                required
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">繰越利益剰余金</Label>
                                        <div className="relative">
                                            <NumberInput
                                                name="ownRetainedEarnings2Prev"
                                                placeholder="0"
                                                onChange={handleChange}
                                                value={formData.ownRetainedEarnings2Prev}
                                                required
                                                className="pr-8 text-right bg-white"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Real-time Preview */}
                        <div className="space-y-3 bg-green-50 p-4 rounded-lg border-2 border-green-300 text-sm">
                            <div className="flex items-center gap-2 pb-2 border-b border-green-400">
                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
                                <h4 className="font-bold text-green-900">計算結果：リアルタイムプレビュー (1株50円換算)</h4>
                            </div>

                            {(() => {
                                // Calculate Share Count (50 yen par value)
                                // Use basicInfo.capital if available, otherwise 0.
                                // NOTE: Logic uses ownCapitalPrev usually, but for preview we strive for real-time.
                                // If Own Capital Prev is entered, use it? Or use Basic Info Capital?
                                // Let's use BasicInfo Capital as the base for 50-yen share count as it is "Capital".
                                // Wait, the authorized logic change used `ownCapitalPrev`.
                                // Let's use `ownCapitalPrev` from formData if > 0, else basicInfo.capital.
                                const capPrev = Number(formData.ownCapitalPrev) > 0 ? Number(formData.ownCapitalPrev) : (basicInfo.capital || 0);
                                const shareCount50 = Math.floor((capPrev * 1000) / 50) || 1;

                                // b: Dividends (2 Year Avg)
                                const divAvg = ((Number(formData.ownDividendPrev) + Number(formData.ownDividend2Prev)) * 1000) / 2;
                                const b = Math.floor((divAvg / shareCount50) * 10) / 10;

                                // c: Profit - Min(Prev, Avg(Prev, 2Prev))
                                const p1Val = (Number(formData.ownTaxableIncomePrev) + Number(formData.ownCarryForwardLossPrev)) * 1000;
                                const p2Val = (Number(formData.ownTaxableIncome2Prev) + Number(formData.ownCarryForwardLoss2Prev)) * 1000;
                                const p3Val = (Number(formData.ownTaxableIncome3Prev) + Number(formData.ownCarryForwardLoss3Prev)) * 1000;

                                const profitPerSharePrev = p1Val / shareCount50;
                                const profitPerShareAvg = ((p1Val + p2Val) / 2) / shareCount50;

                                // Calculate individual profit values (整数に切り捨て)
                                // For c1 selection
                                const profitC1Single = Math.floor(Math.max(0, profitPerSharePrev)); // c1の「直前」: 直前期
                                const profitC1Avg = Math.floor(Math.max(0, profitPerShareAvg)); // c1の「2年平均」: 直前期と2期前の平均

                                // For c2 selection
                                const profitC2Single = Math.floor(Math.max(0, p2Val / shareCount50)); // c2の「直前」: 2期前
                                const profitC2Avg = Math.floor(Math.max(0, ((p2Val + p3Val) / 2) / shareCount50)); // c2の「2年平均」: 2期前と3期前の平均

                                // c: Main profit value based on selection
                                let c: number;
                                let cMethod: string;
                                if (profitMethodC === "c1") {
                                    c = profitC1Single;
                                    cMethod = "直前";
                                } else if (profitMethodC === "c2") {
                                    c = profitC1Avg;
                                    cMethod = "2年平均";
                                } else {
                                    c = Math.floor(Math.max(0, Math.min(profitPerSharePrev, profitPerShareAvg)));
                                    cMethod = "自動";
                                }

                                // c1 based on selection
                                let c1Display: number;
                                let c1Method: string;
                                if (profitMethodC1 === "c1") {
                                    c1Display = profitC1Single; // 直前期
                                    c1Method = "直前";
                                } else if (profitMethodC1 === "c2") {
                                    c1Display = profitC1Avg; // 直前期と2期前の平均
                                    c1Method = "2年平均";
                                } else {
                                    c1Display = Math.min(profitC1Single, profitC1Avg); // 自動: 少ない方
                                    c1Method = "自動";
                                }

                                // c2 based on selection
                                let c2Display: number;
                                let c2Method: string;
                                if (profitMethodC2 === "c1") {
                                    c2Display = profitC2Single; // 2期前
                                    c2Method = "直前";
                                } else if (profitMethodC2 === "c2") {
                                    c2Display = profitC2Avg; // 2期前と3期前の平均
                                    c2Method = "2年平均";
                                } else {
                                    c2Display = Math.min(profitC2Single, profitC2Avg); // 自動: 少ない方
                                    c2Method = "自動";
                                }

                                // d: Book Value - Last Period Only
                                const bv1 = (Number(formData.ownCapitalPrev) + Number(formData.ownRetainedEarningsPrev)) * 1000;
                                const d = Math.floor(bv1 / shareCount50);

                                // Additional calculations for b1, b2
                                const b1 = b; // (直前期 + 2期前) ÷ 2
                                const b2Avg = ((Number(formData.ownDividend2Prev) + Number(formData.ownDividend3Prev)) * 1000) / 2;
                                const b2 = Math.floor((b2Avg / shareCount50) * 10) / 10;

                                // For display: Use the display values calculated above
                                const c1 = c1Display;
                                const c2 = c2Display;

                                // For judgment: Always use actual c1 (直前) and c2 (2年平均) raw values before flooring
                                const c1Actual = profitPerSharePrev;  // 直前期の生の値
                                const c2Actual = profitPerShareAvg;   // 2年平均の生の値

                                // d1, d2 calculations
                                const d1 = d; // 直前期
                                const bv2 = (Number(formData.ownCapital2Prev) + Number(formData.ownRetainedEarnings2Prev)) * 1000;
                                const d2Raw = bv2 / shareCount50;  // 生の値
                                const d2 = Math.floor(d2Raw);

                                return (
                                    <div className="space-y-4">
                                        {/* 上段: b, c, d */}
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-semibold text-black">類似業種比準価額の要素</h5>

                                            <div className="flex justify-between items-center pl-4">
                                                <span className="text-muted-foreground whitespace-nowrap">1株当たりの配当金額 (b)</span>

                                                <div className="text-[10px] text-muted-foreground px-2 text-right flex-1">
                                                    ({Number(formData.ownDividendPrev).toLocaleString()} + {Number(formData.ownDividend2Prev).toLocaleString()})千円 ÷ 2 ÷ {shareCount50.toLocaleString()}株 =
                                                </div>

                                                <div className="text-right whitespace-nowrap">
                                                    <span className="font-bold">{b.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                                                    <span className="text-xs ml-1 text-muted-foreground">円</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pl-4">
                                                <span className="text-muted-foreground whitespace-nowrap">1株当たりの利益金額 (c)</span>

                                                <div className="text-[10px] text-muted-foreground px-2 text-right flex-1">
                                                    {cMethod === "自動"
                                                        ? `自動 直前期:${(p1Val / 1000).toLocaleString()}千円÷${shareCount50.toLocaleString()}株=${profitC1Single}円 or 2年平均:(${(p1Val / 1000).toLocaleString()}+${(p2Val / 1000).toLocaleString()})千円÷2÷${shareCount50.toLocaleString()}株=${profitC1Avg}円`
                                                        : cMethod === "直前"
                                                        ? `直前期: ${(p1Val / 1000).toLocaleString()}千円 ÷ ${shareCount50.toLocaleString()}株`
                                                        : `2年平均: (${(p1Val / 1000).toLocaleString()}+${(p2Val / 1000).toLocaleString()})千円 ÷ 2 ÷ ${shareCount50.toLocaleString()}株`
                                                    } =
                                                </div>

                                                <div className="text-right whitespace-nowrap">
                                                    <span className="font-bold">{c.toLocaleString()}</span>
                                                    <span className="text-xs ml-1 text-muted-foreground">円</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pl-4">
                                                <span className="text-muted-foreground whitespace-nowrap">1株当たりの純資産価額 (d)</span>

                                                <div className="text-[10px] text-muted-foreground px-2 text-right flex-1">
                                                    ({Number(formData.ownCapitalPrev).toLocaleString()} + {Number(formData.ownRetainedEarningsPrev).toLocaleString()})千円 ÷ {shareCount50.toLocaleString()}株 =
                                                </div>

                                                <div className="text-right whitespace-nowrap">
                                                    <span className="font-bold">{d.toLocaleString()}</span>
                                                    <span className="text-xs ml-1 text-muted-foreground">円</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 下段: b1, b2, c1, c2, d1, d2 */}
                                        <div className="border-t border-dashed border-primary/20 pt-3 space-y-2">
                                            <h5 className="text-xs font-semibold text-black mb-2">比準要素数1の会社・比準要素数0の会社の判定要素</h5>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center bg-blue-50/50 p-2 rounded text-xs">
                                                    <span className="text-black whitespace-nowrap">1株当たりの配当金額（b1）:</span>
                                                    <div className="text-[9px] text-muted-foreground px-2 text-right flex-1">
                                                        ({Number(formData.ownDividendPrev).toLocaleString()} + {Number(formData.ownDividend2Prev).toLocaleString()})千円 ÷ 2 ÷ {shareCount50.toLocaleString()}株 =
                                                    </div>
                                                    <span className={`font-semibold whitespace-nowrap ${b1 === 0 ? 'text-red-600' : 'text-black'}`}>{b1.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}円</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-blue-50/50 p-2 rounded text-xs">
                                                    <span className="text-black whitespace-nowrap">1株当たりの配当金額（b2）:</span>
                                                    <div className="text-[9px] text-muted-foreground px-2 text-right flex-1">
                                                        ({Number(formData.ownDividend2Prev).toLocaleString()} + {Number(formData.ownDividend3Prev).toLocaleString()})千円 ÷ 2 ÷ {shareCount50.toLocaleString()}株 =
                                                    </div>
                                                    <span className={`font-semibold whitespace-nowrap ${b2 === 0 ? 'text-red-600' : 'text-black'}`}>{b2.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}円</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center bg-green-50/50 p-2 rounded text-xs">
                                                    <span className="text-black whitespace-nowrap">1株当たりの利益金額（c1）:</span>
                                                    <div className="text-[9px] text-muted-foreground px-2 text-right flex-1">
                                                        {c1Method === "自動"
                                                            ? `自動 直前期:${(p1Val / 1000).toLocaleString()}千円÷${shareCount50.toLocaleString()}株=${profitC1Single}円 or 2年平均:(${(p1Val / 1000).toLocaleString()}+${(p2Val / 1000).toLocaleString()})千円÷2÷${shareCount50.toLocaleString()}株=${profitC1Avg}円`
                                                            : c1Method === "直前"
                                                            ? `直前期: ${(p1Val / 1000).toLocaleString()}千円 ÷ ${shareCount50.toLocaleString()}株 = ${profitC1Single}円`
                                                            : `2年平均: (${(p1Val / 1000).toLocaleString()}+${(p2Val / 1000).toLocaleString()})千円 ÷ 2 ÷ ${shareCount50.toLocaleString()}株 = ${profitC1Avg}円`
                                                        }
                                                    </div>
                                                    <span className={`font-semibold whitespace-nowrap ${c1Display === 0 ? 'text-red-600' : 'text-black'}`}>{c1Display.toLocaleString()}円</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-green-50/50 p-2 rounded text-xs">
                                                    <span className="text-black whitespace-nowrap">1株当たりの利益金額（c2）:</span>
                                                    <div className="text-[9px] text-muted-foreground px-2 text-right flex-1">
                                                        {c2Method === "自動"
                                                            ? `自動 2期前:${(p2Val / 1000).toLocaleString()}千円÷${shareCount50.toLocaleString()}株=${profitC2Single}円 or 2年平均:(${(p2Val / 1000).toLocaleString()}+${(p3Val / 1000).toLocaleString()})千円÷2÷${shareCount50.toLocaleString()}株=${profitC2Avg}円`
                                                            : c2Method === "直前"
                                                            ? `2期前: ${(p2Val / 1000).toLocaleString()}千円 ÷ ${shareCount50.toLocaleString()}株 = ${profitC2Single}円`
                                                            : `2年平均: (${(p2Val / 1000).toLocaleString()}+${(p3Val / 1000).toLocaleString()})千円 ÷ 2 ÷ ${shareCount50.toLocaleString()}株 = ${profitC2Avg}円`
                                                        }
                                                    </div>
                                                    <span className={`font-semibold whitespace-nowrap ${c2Display === 0 ? 'text-red-600' : 'text-black'}`}>{c2Display.toLocaleString()}円</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center bg-purple-50/50 p-2 rounded text-xs">
                                                    <span className="text-black whitespace-nowrap">1株当たりの純資産価額（d1）:</span>
                                                    <div className="text-[9px] text-muted-foreground px-2 text-right flex-1">
                                                        ({Number(formData.ownCapitalPrev).toLocaleString()} + {Number(formData.ownRetainedEarningsPrev).toLocaleString()})千円 ÷ {shareCount50.toLocaleString()}株 =
                                                    </div>
                                                    <span className={`font-semibold whitespace-nowrap ${d1 === 0 ? 'text-red-600' : 'text-black'}`}>{d1.toLocaleString()}円</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-purple-50/50 p-2 rounded text-xs">
                                                    <span className="text-black whitespace-nowrap">1株当たりの純資産価額（d2）:</span>
                                                    <div className="text-[9px] text-muted-foreground px-2 text-right flex-1">
                                                        ({Number(formData.ownCapital2Prev).toLocaleString()} + {Number(formData.ownRetainedEarnings2Prev).toLocaleString()})千円 ÷ {shareCount50.toLocaleString()}株 =
                                                    </div>
                                                    <span className={`font-semibold whitespace-nowrap ${d2 === 0 ? 'text-red-600' : 'text-black'}`}>{d2.toLocaleString()}円</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 評価方法の判定と警告表示（優先順位: 比準要素数0 → 比準要素数1 → 一般） */}
                                        {(() => {
                                            // 比準要素数0の会社の判定（切り捨て後の表示値を使用して判定）
                                            const isZeroElem = b1 <= 0 && c1 <= 0 && d1 <= 0;

                                            if (isZeroElem) {
                                                return (
                                                    <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 mt-3">
                                                        <p className="text-xs font-bold text-amber-900">
                                                            ⚠️ 比準要素数0の会社 (b1=0, c1=0, d1=0)
                                                        </p>
                                                        <p className="text-[10px] text-amber-800 mt-1">
                                                            純資産価額
                                                        </p>
                                                    </div>
                                                );
                                            }

                                            // 比準要素数1の会社の判定（比準要素数0に該当しない場合のみ）
                                            // 切り捨て後の表示値を使用して判定
                                            const zeroCountB1C1D1 = [b1, c1, d1].filter(v => v <= 0).length;
                                            const zeroCountB2C2D2 = [b2, c2, d2].filter(v => v <= 0).length;
                                            const isOneElem = zeroCountB1C1D1 >= 2 && zeroCountB2C2D2 >= 2;

                                            if (isOneElem) {
                                                return (
                                                    <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 mt-3">
                                                        <p className="text-xs font-bold text-orange-900">
                                                            ⚠️ 比準要素数1の会社
                                                        </p>
                                                        <p className="text-[10px] text-orange-800 mt-1">
                                                            b1, c1, d1のいずれか2つが「0」かつ b2, c2, d2の2以上が「0」
                                                        </p>
                                                        <p className="text-[10px] text-orange-800 mt-2">
                                                            次のうちいずれか低い方の金額
                                                        </p>
                                                        <p className="text-[10px] text-orange-800 pl-3">
                                                            イ　純資産価格
                                                        </p>
                                                        <p className="text-[10px] text-orange-800 pl-3">
                                                            ロ　（ 類似業種比準価格 × 0.25 ）＋（ 純資産価格 × 0.75 ）
                                                        </p>
                                                    </div>
                                                );
                                            }

                                            // 一般の評価会社（該当する場合は表示）
                                            return (
                                                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 mt-3">
                                                    <p className="text-xs font-bold text-blue-900">
                                                        ✓ 一般の評価会社
                                                    </p>
                                                    <p className="text-[10px] text-blue-800 mt-1">
                                                        標準的な類似業種比準方式で評価します
                                                    </p>
                                                </div>
                                            );
                                        })()}

                                        <div className="text-[10px] text-right text-muted-foreground pt-2 border-t border-dashed border-primary/10">
                                            ※ {shareCount50.toLocaleString()}株 (50円換算) で計算
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
                            戻る
                        </Button>
                        <Button type="submit" size="lg" className="flex-[2] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            次へ進む
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
