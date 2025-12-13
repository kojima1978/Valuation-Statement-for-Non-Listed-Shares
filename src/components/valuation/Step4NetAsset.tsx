"use client";

import { useState } from "react";
import { BasicInfo, Financials } from "@/types/valuation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";

interface Step4Props {
    basicInfo: BasicInfo;
    onBack: () => void;
    onNext: (data: Partial<Financials>) => void;
    defaultValues?: Partial<Financials>;
}

export function Step4NetAsset({ basicInfo, onBack, onNext, defaultValues }: Step4Props) {
    const [formData, setFormData] = useState({
        assetsBookValue: defaultValues?.assetsBookValue?.toString() || "",
        liabilitiesBookValue: defaultValues?.liabilitiesBookValue?.toString() || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const assetsBookValue = Number(formData.assetsBookValue);
        const liabilitiesBookValue = Number(formData.liabilitiesBookValue);

        onNext({
            assetsBookValue,
            liabilitiesBookValue,
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-primary">純資産価額の入力 (Step 4/5)</h2>
                <p className="text-muted-foreground">帳簿価額ベースの資産・負債を入力します。</p>
            </div>

            <Card className="p-6 border-secondary/20 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Net Assets Data */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-dashed">
                            <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">4</div>
                            <h3 className="text-lg font-bold">純資産価額の計算要素</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="assetsBookValue">資産の部 (帳簿価額)</Label>
                                <div className="relative">
                                    <NumberInput
                                        id="assetsBookValue"
                                        name="assetsBookValue"
                                        placeholder="0"
                                        value={formData.assetsBookValue}
                                        onChange={handleChange}
                                        required
                                        className="pr-8"
                                    />
                                    <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">円</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="liabilitiesBookValue">負債の部 (帳簿価額)</Label>
                                <div className="relative">
                                    <NumberInput
                                        id="liabilitiesBookValue"
                                        name="liabilitiesBookValue"
                                        placeholder="0"
                                        value={formData.liabilitiesBookValue}
                                        onChange={handleChange}
                                        required
                                        className="pr-8"
                                    />
                                    <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">円</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-right">※評価差額に対する法人税額等の控除は考慮しません</p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
                            戻る
                        </Button>
                        <Button type="submit" size="lg" className="flex-[2] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            試算する (Step 5へ)
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
