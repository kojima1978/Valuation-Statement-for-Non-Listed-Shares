"use client";

import { useState } from "react";
import { BasicInfo } from "@/types/valuation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";

interface Step1Props {
    onNext: (data: Partial<BasicInfo>) => void;
    defaultValues?: Partial<BasicInfo>;
}

export function Step1BasicInfo({ onNext, defaultValues }: Step1Props) {
    const [formData, setFormData] = useState({
        companyName: defaultValues?.companyName || "",
        taxationPeriod: defaultValues?.taxationPeriod || "",
        previousPeriod: defaultValues?.previousPeriod || "",
        capital: defaultValues?.capital?.toString() || "",
        issuedShares: defaultValues?.issuedShares?.toString() || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Parse numbers
        const capital = Number(formData.capital.replace(/,/g, ""));
        const issuedShares = Number(formData.issuedShares.replace(/,/g, ""));

        if (issuedShares < 1) {
            alert("発行済株式数は1株以上を入力してください。");
            return;
        }

        onNext({
            companyName: formData.companyName,
            taxationPeriod: formData.taxationPeriod,
            previousPeriod: formData.previousPeriod,
            capital,
            issuedShares,
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-primary">基本情報の入力 (Step 1/4)</h2>
                <p className="text-muted-foreground">会社名や評価時期などの基本情報を入力します。</p>
            </div>

            <Card className="p-6 border-secondary/20 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Company Basic Data Section */}
                        <div className="space-y-4 bg-primary/5 p-4 rounded-lg">
                            <div className="flex items-center gap-2 pb-2 border-b border-dashed">
                                <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">1</div>
                                <h3 className="text-lg font-bold">会社基本データ</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">会社名</Label>
                                    <Input
                                        id="companyName"
                                        name="companyName"
                                        placeholder="例: 株式会社サンプル"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        className="bg-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="taxationPeriod">課税時期</Label>
                                        <Input
                                            id="taxationPeriod"
                                            name="taxationPeriod"
                                            type="date"
                                            value={formData.taxationPeriod}
                                            onChange={handleChange}
                                            required
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="previousPeriod">直前期末</Label>
                                        <Input
                                            id="previousPeriod"
                                            name="previousPeriod"
                                            type="date"
                                            value={formData.previousPeriod}
                                            onChange={handleChange}
                                            required
                                            className="bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="capital">資本金等の額</Label>
                                    <div className="relative">
                                        <NumberInput
                                            id="capital"
                                            name="capital"
                                            placeholder="0"
                                            value={formData.capital}
                                            onChange={handleChange}
                                            required
                                            className="pr-12 text-right bg-white"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">千円</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="issuedShares">発行済株式数</Label>
                                    <div className="relative">
                                        <NumberInput
                                            id="issuedShares"
                                            name="issuedShares"
                                            placeholder="0"
                                            value={formData.issuedShares}
                                            onChange={handleChange}
                                            required
                                            className="pr-12 text-right bg-white"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">株</span>
                                    </div>
                                </div>
                            </div>

                            {/* Calculation Preview */}
                            {(Number(formData.capital) > 0 && Number(formData.issuedShares) > 0) && (
                                <div className="space-y-3 bg-white/50 p-4 rounded-lg border border-primary/10 text-sm">
                                    <h4 className="font-bold text-muted-foreground border-b border-primary/10 pb-1 mb-2">リアルタイムプレビュー</h4>

                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">1株当たりの資本金額</span>
                                        <div className="text-right">
                                            <span className="font-bold">
                                                {Math.floor((Number(formData.capital) * 1000) / Number(formData.issuedShares)).toLocaleString()}
                                            </span>
                                            <span className="text-xs ml-1 text-muted-foreground">円</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-right text-muted-foreground mb-2">
                                        計算式: {Number(formData.capital).toLocaleString()}千円 ÷ {Number(formData.issuedShares).toLocaleString()}株
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-primary/20">
                                        <span className="text-muted-foreground">1株50円とした場合の発行済株式数</span>
                                        <div className="text-right">
                                            <span className="font-bold">
                                                {Math.floor((Number(formData.capital) * 1000) / 50).toLocaleString()}
                                            </span>
                                            <span className="text-xs ml-1 text-muted-foreground">株</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-right text-muted-foreground">
                                        計算式: {Number(formData.capital).toLocaleString()}千円 ÷ 50円
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full text-lg mt-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                        次へ進む
                    </Button>
                </form >
            </Card >
        </div >
    );
}
