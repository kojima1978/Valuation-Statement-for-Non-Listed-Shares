"use client";

import { useState } from "react";
import { BasicInfo, Financials } from "@/types/valuation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";

interface Step5Props {
    basicInfo: BasicInfo;
    onBack: () => void;
    onNext: (data: Partial<Financials>) => void;
    defaultValues?: Partial<Financials>;
}

export function Step5NetAsset({ basicInfo, onBack, onNext, defaultValues }: Step5Props) {
    const [formData, setFormData] = useState({
        // Convert Yen to Thousand Yen for display if values exist
        assetsBookValue: defaultValues?.assetsBookValue ? (defaultValues.assetsBookValue / 1000).toString() : "",
        assetsInheritanceValue: defaultValues?.assetsInheritanceValue ? (defaultValues.assetsInheritanceValue / 1000).toString() : "",
        liabilitiesBookValue: defaultValues?.liabilitiesBookValue ? (defaultValues.liabilitiesBookValue / 1000).toString() : "",
        liabilitiesInheritanceValue: defaultValues?.liabilitiesInheritanceValue ? (defaultValues.liabilitiesInheritanceValue / 1000).toString() : "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert Thousand Yen inputs back to Yen for storage
        const assetsBookValue = Number(formData.assetsBookValue) * 1000;
        const assetsInheritanceValue = formData.assetsInheritanceValue ? Number(formData.assetsInheritanceValue) * 1000 : undefined;
        const liabilitiesBookValue = Number(formData.liabilitiesBookValue) * 1000;
        const liabilitiesInheritanceValue = formData.liabilitiesInheritanceValue ? Number(formData.liabilitiesInheritanceValue) * 1000 : undefined;

        onNext({
            assetsBookValue,
            assetsInheritanceValue,
            liabilitiesBookValue,
            liabilitiesInheritanceValue,
        });
    };

    const handleCopyInheritanceToBook = () => {
        setFormData((prev) => ({
            ...prev,
            assetsBookValue: prev.assetsInheritanceValue,
            liabilitiesBookValue: prev.liabilitiesInheritanceValue,
        }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-primary">純資産価額の入力 (Step 5/6)</h2>
                <p className="text-muted-foreground">帳簿価額および相続税評価額を入力します。</p>
            </div>

            <Card className="p-6 border-secondary/20 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Net Assets Data */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-dashed">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">5</div>
                                <h3 className="text-lg font-bold">純資産価額の計算要素</h3>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleCopyInheritanceToBook}
                                className="text-xs"
                            >
                                相続税評価額を帳簿価格に複写
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Assets */}
                            <div className="space-y-4 p-4 rounded-lg bg-primary/5">
                                <Label className="font-bold underline">資産の部</Label>

                                {/* Order: Inheritance Value (Top), Book Value (Bottom) */}
                                <div className="space-y-2">
                                    <Label htmlFor="assetsInheritanceValue" className="text-sm font-bold">相続税評価額</Label>
                                    <div className="relative">
                                        <NumberInput
                                            id="assetsInheritanceValue"
                                            name="assetsInheritanceValue"
                                            placeholder="0"
                                            value={formData.assetsInheritanceValue}
                                            onChange={handleChange}
                                            className="pr-12 text-right bg-white"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">千円</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assetsBookValue" className="text-sm">帳簿価額</Label>
                                    <div className="relative">
                                        <NumberInput
                                            id="assetsBookValue"
                                            name="assetsBookValue"
                                            placeholder="0"
                                            value={formData.assetsBookValue}
                                            onChange={handleChange}
                                            required
                                            className="pr-12 text-right bg-white"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">千円</span>
                                    </div>
                                </div>
                            </div>

                            {/* Liabilities */}
                            <div className="space-y-4 p-4 rounded-lg bg-primary/5">
                                <Label className="font-bold underline">負債の部</Label>

                                {/* Order: Inheritance Value (Top), Book Value (Bottom) */}
                                <div className="space-y-2">
                                    <Label htmlFor="liabilitiesInheritanceValue" className="text-sm font-bold">相続税評価額</Label>
                                    <div className="relative">
                                        <NumberInput
                                            id="liabilitiesInheritanceValue"
                                            name="liabilitiesInheritanceValue"
                                            placeholder="0"
                                            value={formData.liabilitiesInheritanceValue}
                                            onChange={handleChange}
                                            className="pr-12 text-right bg-white"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">千円</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="liabilitiesBookValue" className="text-sm">帳簿価額</Label>
                                    <div className="relative">
                                        <NumberInput
                                            id="liabilitiesBookValue"
                                            name="liabilitiesBookValue"
                                            placeholder="0"
                                            value={formData.liabilitiesBookValue}
                                            onChange={handleChange}
                                            required
                                            className="pr-12 text-right bg-white"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">千円</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Real-time Result Preview */}
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                        <h3 className="text-sm font-bold text-muted-foreground mb-2">純資産価額の計算結果 (リアルタイムプレビュー)</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                <span className="text-sm text-muted-foreground">相続税評価額ベースの純資産</span>
                                <span className="font-bold">
                                    {(() => {
                                        const assets = Number(formData.assetsInheritanceValue) * 1000;
                                        const liabilities = Number(formData.liabilitiesInheritanceValue) * 1000;
                                        return (assets - liabilities).toLocaleString();
                                    })()} 円
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                <span className="text-sm text-muted-foreground">帳簿価額ベースの純資産</span>
                                <span className="font-bold">
                                    {(() => {
                                        const assets = Number(formData.assetsBookValue) * 1000;
                                        const liabilities = Number(formData.liabilitiesBookValue) * 1000;
                                        return (assets - liabilities).toLocaleString();
                                    })()} 円
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                <span className="text-sm text-muted-foreground">評価差額に対する法人税額等 (37%)</span>
                                <span className="font-bold text-red-500">
                                    ▲ {(() => {
                                        const assetsInh = Number(formData.assetsInheritanceValue) * 1000;
                                        const liabInh = Number(formData.liabilitiesInheritanceValue) * 1000;
                                        const netInh = assetsInh - liabInh;

                                        const assetsBook = Number(formData.assetsBookValue) * 1000;
                                        const liabBook = Number(formData.liabilitiesBookValue) * 1000;
                                        const netBook = assetsBook - liabBook;

                                        const diff = netInh - netBook;
                                        if (diff <= 0) return "0";
                                        return Math.floor(diff * 0.37).toLocaleString();
                                    })()} 円
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">1株あたりの純資産価額</p>
                                    <p className="text-xs text-muted-foreground">(発行済株式数: {basicInfo.issuedShares?.toLocaleString() ?? 0}株)</p>
                                </div>
                                <p className="text-2xl font-black text-primary">
                                    {(() => {
                                        const assetsInh = Number(formData.assetsInheritanceValue) * 1000;
                                        const liabInh = Number(formData.liabilitiesInheritanceValue) * 1000;
                                        const netInh = assetsInh - liabInh;

                                        const assetsBook = Number(formData.assetsBookValue) * 1000;
                                        const liabBook = Number(formData.liabilitiesBookValue) * 1000;
                                        const netBook = assetsBook - liabBook;

                                        const diff = netInh - netBook;
                                        const tax = diff > 0 ? diff * 0.37 : 0;

                                        const totalNetAsset = netInh - tax;
                                        const shares = basicInfo.issuedShares || 1;

                                        return Math.floor(totalNetAsset / shares).toLocaleString();
                                    })()} <span className="text-sm font-normal text-muted-foreground">円</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
                            戻る
                        </Button>
                        <Button type="submit" size="lg" className="flex-[2] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            試算する (Step 6へ)
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
