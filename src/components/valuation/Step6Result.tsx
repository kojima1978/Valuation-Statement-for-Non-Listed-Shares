"use client";

import { BasicInfo, Financials } from "@/types/valuation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMemo } from "react";
import Link from "next/link";


import { calculateFinalValuation } from "@/lib/valuation-logic";

interface Step6Props {
    basicInfo: BasicInfo;
    financials: Financials;
    onBack: () => void;
    onNext?: () => void;
}

export function Step6Result({ basicInfo, financials, onBack, onNext }: Step6Props) {
    // Calculation Logic
    // Use calculateFinalValuation from logic.ts to ensure consistency including conversion ratio
    const results = useMemo(() => {
        const result = calculateFinalValuation(basicInfo, financials);
        return result;
    }, [basicInfo, financials]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-primary">試算結果 (Step 6/6)</h2>
                <p className="text-muted-foreground">最も有利（低価）となる評価方式を自動判定しました。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Result */}
                <Card className="col-span-1 md:col-span-2 p-8 border-4 border-primary/20 shadow-xl bg-gradient-to-br from-white to-primary/5">
                    <div className="text-center space-y-4">
                        <h3 className="text-xl font-bold text-muted-foreground">1株あたりの評価額</h3>
                        <div className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">
                            {results.finalValue.toLocaleString()}
                            <span className="text-xl md:text-2xl text-muted-foreground ml-2 font-bold">円</span>
                        </div>

                        {/* Comparison Table */}
                        <div className="mt-4 bg-white/50 p-4 rounded-lg border border-secondary/10 inline-block text-left min-w-[300px]">
                            <p className="text-xs text-center text-muted-foreground mb-2">- 判定根拠 (低い方を選択) -</p>
                            <div className="space-y-2">
                                {results.comparisonDetails.map((item, idx) => (
                                    <div key={idx} className={`flex justify-between text-sm ${item.value === results.finalValue ? "font-bold text-primary" : "text-muted-foreground"}`}>
                                        <span>{item.name}</span>
                                        <span>{item.value.toLocaleString()} 円</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Breakdown: Comparable */}
                <Card className="p-6 border-secondary/20">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2">
                            <span className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold">A</span>
                            <h4 className="font-bold">類似業種比準価額 (S)</h4>
                        </div>
                        <div className="text-3xl font-bold text-right text-secondary">
                            {results.comparableValue.toLocaleString()} <span className="text-sm text-foreground">円</span>
                        </div>
                    </div>
                </Card>

                {/* Breakdown: Net Asset */}
                <Card className="p-6 border-accent/50">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2">
                            <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">B</span>
                            <h4 className="font-bold">純資産価額 (N)</h4>
                        </div>
                        <div className="text-3xl font-bold text-right">
                            {results.netAssetPerShare.toLocaleString()} <span className="text-sm text-muted-foreground">円</span>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 pt-8">
                <Button variant="outline" onClick={onBack} size="lg">
                    戻って修正する
                </Button>
                {onNext && (
                    <Button onClick={onNext} size="lg" className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        シミュレーションへ
                    </Button>
                )}
            </div>
        </div>
    );
}
