"use client";

import { BasicInfo, Financials } from "@/types/valuation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMemo } from "react";
import { calculateFinalValuation, calculateCorporateTaxFairValue, calculateOwnFinancials } from "@/lib/valuation-logic";

interface ValuationSummaryProps {
    basicInfo: BasicInfo;
    financials: Financials;
    onBack: () => void;
    onHome?: () => void;
}

export function ValuationSummary({ basicInfo, financials, onBack, onHome }: ValuationSummaryProps) {
    const results = useMemo(() => {
        // Step 6: 計算結果
        const step6Result = calculateFinalValuation(basicInfo, financials);

        // Step 7: 法人税法上の時価
        const step7Result = calculateCorporateTaxFairValue(basicInfo, financials);

        // Step 8: シミュレーション（直前期利益=0の場合）
        const simData = {
            divPrev: financials.ownDividendPrev || 0,
            div2Prev: financials.ownDividend2Prev || 0,
            div3Prev: financials.ownDividend3Prev || 0,
            p1: 0,
            l1: financials.ownCarryForwardLossPrev || 0,
            p2: financials.ownTaxableIncome2Prev || 0,
            l2: financials.ownCarryForwardLoss2Prev || 0,
            p3: financials.ownTaxableIncome3Prev || 0,
            l3: financials.ownCarryForwardLoss3Prev || 0,
            cap1: financials.ownCapitalPrev || 0,
            re1: financials.ownRetainedEarningsPrev || 0,
            cap2: financials.ownCapital2Prev || 0,
            re2: financials.ownRetainedEarnings2Prev || 0,
        };

        const simOwnFinancials = calculateOwnFinancials(simData, basicInfo.issuedShares);

        const simFinancials: Financials = {
            ...financials,
            ownProfit: simOwnFinancials.ownProfit,
        };

        const step8Result = calculateFinalValuation(basicInfo, simFinancials);

        return {
            step6: step6Result,
            step7: step7Result,
            step8: step8Result,
        };
    }, [basicInfo, financials]);

    const totalShares = basicInfo.issuedShares || 1;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-primary">評価まとめ</h2>
                <p className="text-muted-foreground">各ステップの評価結果をまとめて表示します。</p>
            </div>

            <div className="space-y-6">
                {/* Step 6: 相続税評価額 */}
                <Card className="p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b-2 border-primary/30">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">6</div>
                            <h3 className="text-xl font-bold text-primary">相続税評価額 (Step 6/6)</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/60 p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">1株あたりの相続税評価額</div>
                                <div className="text-3xl font-bold text-primary">
                                    {results.step6.finalValue.toLocaleString()} <span className="text-lg text-muted-foreground">円</span>
                                </div>
                            </div>

                            <div className="bg-white/60 p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">相続税評価額（総額：{totalShares.toLocaleString()}株）</div>
                                <div className="text-3xl font-bold text-primary">
                                    {(results.step6.finalValue * totalShares).toLocaleString()} <span className="text-lg text-muted-foreground">円</span>
                                </div>
                            </div>

                            <div className="bg-white/60 p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">類似業種比準価額</div>
                                <div className="text-2xl font-bold text-secondary">
                                    {results.step6.comparableValue.toLocaleString()} <span className="text-sm text-muted-foreground">円</span>
                                </div>
                            </div>

                            <div className="bg-white/60 p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">純資産価額</div>
                                <div className="text-2xl font-bold text-secondary">
                                    {results.step6.netAssetPerShare.toLocaleString()} <span className="text-sm text-muted-foreground">円</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Step 7: 法人税法上の時価 */}
                <Card className="p-6 border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100/30">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b-2 border-green-300">
                            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">7</div>
                            <h3 className="text-xl font-bold text-green-900">法人税法上の時価 (Step 7/8)</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/60 p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">評価額（1株あたり）</div>
                                <div className="text-3xl font-bold text-green-700">
                                    {results.step7.finalValue.toLocaleString()} <span className="text-lg text-muted-foreground">円</span>
                                </div>
                            </div>

                            <div className="bg-white/60 p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">評価額（総額：{totalShares.toLocaleString()}株）</div>
                                <div className="text-3xl font-bold text-green-700">
                                    {(results.step7.finalValue * totalShares).toLocaleString()} <span className="text-lg text-muted-foreground">円</span>
                                </div>
                            </div>

                            <div className="bg-white/60 p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">類似業種比準価額</div>
                                <div className="text-2xl font-bold text-secondary">
                                    {results.step7.comparableValue.toLocaleString()} <span className="text-sm text-muted-foreground">円</span>
                                </div>
                            </div>

                            <div className="bg-white/60 p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">純資産価額</div>
                                <div className="text-2xl font-bold text-secondary">
                                    {results.step7.netAssetPerShare.toLocaleString()} <span className="text-sm text-muted-foreground">円</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Step 8: シミュレーション */}
                <Card className="p-6 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/30">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b-2 border-amber-300">
                            <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">8</div>
                            <h3 className="text-xl font-bold text-amber-900">シミュレーション (Step 8/8)</h3>
                            <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">直前期利益=0</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/60 p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">評価額（1株あたり）</div>
                                <div className="text-3xl font-bold text-amber-700">
                                    {results.step8.finalValue.toLocaleString()} <span className="text-lg text-muted-foreground">円</span>
                                </div>
                            </div>

                            <div className="bg-white/60 p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">評価額（総額：{totalShares.toLocaleString()}株）</div>
                                <div className="text-3xl font-bold text-amber-700">
                                    {(results.step8.finalValue * totalShares).toLocaleString()} <span className="text-lg text-muted-foreground">円</span>
                                </div>
                            </div>

                            <div className="bg-white/60 p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">類似業種比準価額</div>
                                <div className="text-2xl font-bold text-secondary">
                                    {results.step8.comparableValue.toLocaleString()} <span className="text-sm text-muted-foreground">円</span>
                                </div>
                            </div>

                            <div className="bg-white/60 p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">純資産価額</div>
                                <div className="text-2xl font-bold text-secondary">
                                    {results.step8.netAssetPerShare.toLocaleString()} <span className="text-sm text-muted-foreground">円</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 比較表 */}
                <Card className="p-6 border-2 border-slate-300 bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">比較表</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-slate-300">
                                    <th className="text-left py-3 px-2">項目</th>
                                    <th className="text-right py-3 px-2">Step 6<br />相続税評価額</th>
                                    <th className="text-right py-3 px-2">Step 7<br />法人税法</th>
                                    <th className="text-right py-3 px-2">Step 8<br />シミュレーション</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-200">
                                    <td className="py-3 px-2 font-medium">評価額（1株）</td>
                                    <td className="text-right py-3 px-2">{results.step6.finalValue.toLocaleString()}円</td>
                                    <td className="text-right py-3 px-2">{results.step7.finalValue.toLocaleString()}円</td>
                                    <td className="text-right py-3 px-2">{results.step8.finalValue.toLocaleString()}円</td>
                                </tr>
                                <tr className="border-b border-slate-200">
                                    <td className="py-3 px-2 font-medium">評価額（総額）</td>
                                    <td className="text-right py-3 px-2">{(results.step6.finalValue * totalShares).toLocaleString()}円</td>
                                    <td className="text-right py-3 px-2">{(results.step7.finalValue * totalShares).toLocaleString()}円</td>
                                    <td className="text-right py-3 px-2">{(results.step8.finalValue * totalShares).toLocaleString()}円</td>
                                </tr>
                                <tr className="border-b border-slate-200">
                                    <td className="py-3 px-2 font-medium">類似業種比準価額</td>
                                    <td className="text-right py-3 px-2">{results.step6.comparableValue.toLocaleString()}円</td>
                                    <td className="text-right py-3 px-2">{results.step7.comparableValue.toLocaleString()}円</td>
                                    <td className="text-right py-3 px-2">{results.step8.comparableValue.toLocaleString()}円</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-2 font-medium">純資産価額</td>
                                    <td className="text-right py-3 px-2">{results.step6.netAssetPerShare.toLocaleString()}円</td>
                                    <td className="text-right py-3 px-2">{results.step7.netAssetPerShare.toLocaleString()}円</td>
                                    <td className="text-right py-3 px-2">{results.step8.netAssetPerShare.toLocaleString()}円</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 pt-8">
                <Button type="button" variant="outline" onClick={onBack} size="lg">
                    戻る
                </Button>
                {onHome && (
                    <Button type="button" variant="outline" onClick={onHome} size="lg">
                        トップに戻る
                    </Button>
                )}
            </div>
        </div>
    );
}
