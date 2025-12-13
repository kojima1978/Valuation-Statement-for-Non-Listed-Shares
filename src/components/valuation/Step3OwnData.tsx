"use client";

import { useState } from "react";
import { BasicInfo, Financials } from "@/types/valuation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";

interface Step3Props {
    basicInfo: BasicInfo | Partial<BasicInfo>;
    onBack: () => void;
    onNext: (data: Partial<Financials>) => void;
    defaultValues?: Partial<Financials>;
}

export function Step3OwnData({ basicInfo, onBack, onNext, defaultValues }: Step3Props) {
    const [formData, setFormData] = useState({
        // Dividends (Total Amount in Thousand Yen)
        ownDividendPrev: defaultValues?.ownDividendPrev?.toString() || "",
        ownDividend2Prev: defaultValues?.ownDividend2Prev?.toString() || "",
        ownDividend3Prev: defaultValues?.ownDividend3Prev?.toString() || "",

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

        const profitPerSharePrev = profitPrevAmount / shareCount50;
        const profitPerShareAvg = ((profitPrevAmount + profit2PrevAmount) / 2) / shareCount50;

        const ownProfit = Math.floor(Math.max(0, Math.min(profitPerSharePrev, profitPerShareAvg)));

        // 3. Book Value (d) - Last Period Only (Capital + Retained Earnings)
        const cap1 = Number(formData.ownCapitalPrev);
        const re1 = Number(formData.ownRetainedEarningsPrev);
        const cap2 = Number(formData.ownCapital2Prev);
        const re2 = Number(formData.ownRetainedEarnings2Prev);

        const netAssetPrev = (cap1 + re1) * 1000;

        const rawOwnBookValue = netAssetPrev / shareCount50;
        const ownBookValue = Math.floor(rawOwnBookValue);

        onNext({
            // Results
            ownDividends,
            ownProfit,
            ownBookValue,
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
            // Dividends
            ownDividend2Prev: prev.ownDividendPrev,
            ownDividend3Prev: prev.ownDividendPrev,
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
                <h2 className="text-2xl font-black text-primary">自社の実績データ入力 (Step 3/6)</h2>
                <p className="text-muted-foreground">自社の配当と、利益、純資産を入力してください。</p>
            </div>

            <Card className="p-6 border-secondary/20 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-dashed">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">3</div>
                                <h3 className="text-lg font-bold">自社のデータ</h3>
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
                        <div className="space-y-2 bg-primary/5 p-4 rounded-lg">
                            <Label>配当金額 (b)</Label>
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
                                            className="pr-8 text-right bg-white"
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
                                            className="pr-8 text-right bg-white"
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
                                            className="pr-8 text-right bg-white"
                                        />
                                        <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profit */}
                        <div className="space-y-2 bg-primary/5 p-4 rounded-lg">
                            <Label>利益金額 (c)</Label>

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
                                        <Label className="text-[10px] text-muted-foreground">繰越欠損金</Label>
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
                                        <Label className="text-[10px] text-muted-foreground">繰越欠損金</Label>
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
                                        <Label className="text-[10px] text-muted-foreground">繰越欠損金</Label>
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
                        <div className="space-y-2 bg-primary/5 p-4 rounded-lg">
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
                        <div className="space-y-3 bg-white/50 p-4 rounded-lg border border-primary/10 text-sm">
                            <h4 className="font-bold text-muted-foreground border-b border-primary/10 pb-1 mb-2">リアルタイムプレビュー (1株50円換算)</h4>

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
                                // const p3Val = ... (unused for logic)

                                const profitPerSharePrev = p1Val / shareCount50;
                                const profitPerShareAvg = ((p1Val + p2Val) / 2) / shareCount50;

                                const c = Math.floor(Math.max(0, Math.min(profitPerSharePrev, profitPerShareAvg)));
                                // actually calculateOwnFinancials returns raw.

                                // d: Book Value - Last Period Only
                                const bv1 = (Number(formData.ownCapitalPrev) + Number(formData.ownRetainedEarningsPrev)) * 1000;
                                const d = Math.floor(bv1 / shareCount50);

                                return (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground whitespace-nowrap">1株当たりの配当金額 (b)</span>

                                            <div className="text-[10px] text-muted-foreground px-2 text-right flex-1">
                                                ({Number(formData.ownDividendPrev).toLocaleString()} + {Number(formData.ownDividend2Prev).toLocaleString()})千円 ÷ 2 ÷ {shareCount50.toLocaleString()}株 =
                                            </div>

                                            <div className="text-right whitespace-nowrap">
                                                <span className="font-bold">{b.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                                                <span className="text-xs ml-1 text-muted-foreground">円</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground whitespace-nowrap">1株当たりの利益金額 (c)</span>

                                            <div className="text-[10px] text-muted-foreground px-2 text-right flex-1">
                                                Min(直前:{(p1Val / 1000).toLocaleString()}, 平均:{((p1Val + p2Val) / 2000).toLocaleString()})千円 ÷ {shareCount50.toLocaleString()}株 =
                                            </div>

                                            <div className="text-right whitespace-nowrap">
                                                <span className="font-bold">{c.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                                                <span className="text-xs ml-1 text-muted-foreground">円</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground whitespace-nowrap">1株当たりの純資産価額 (d)</span>

                                            <div className="text-[10px] text-muted-foreground px-2 text-right flex-1">
                                                ({Number(formData.ownCapitalPrev).toLocaleString()} + {Number(formData.ownRetainedEarningsPrev).toLocaleString()})千円 ÷ {shareCount50.toLocaleString()}株 =
                                            </div>

                                            <div className="text-right whitespace-nowrap">
                                                <span className="font-bold">{d.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                                                <span className="text-xs ml-1 text-muted-foreground">円</span>
                                            </div>
                                        </div>

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
