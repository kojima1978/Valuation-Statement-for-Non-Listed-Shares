"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { NumberInput } from "@/components/ui/NumberInput";
import { BasicInfo, Financials } from "@/types/valuation";
import { calculateCompanySizeAndL, IndustryType } from "@/lib/valuation-logic";
import { DUMMY_DATA_PATTERNS, DummyDataPatternKey } from "@/lib/dummy-data";

interface BulkInputProps {
  onSubmit: (basicInfo: BasicInfo, financials: Financials) => void;
}

export function BulkInput({ onSubmit }: BulkInputProps) {
  const [formData, setFormData] = useState({
    // Step 1: 基礎情報
    companyName: "",
    taxationPeriod: "",
    previousPeriod: "",
    capital: "",  // 千円
    issuedShares: "",  // 株

    // Step 2: 会社規模
    employees: "",  // 人
    totalAssets: "",  // 千円
    sales: "",  // 千円
    industryType: "Wholesale" as IndustryType,

    // Step 3: 自社データ（千円）
    ownDividendPrev: "",
    ownDividend2Prev: "",
    ownDividend3Prev: "",
    ownTaxableIncomePrev: "",
    ownCarryForwardLossPrev: "",
    ownTaxableIncome2Prev: "",
    ownCarryForwardLoss2Prev: "",
    ownTaxableIncome3Prev: "",
    ownCarryForwardLoss3Prev: "",
    ownCapitalPrev: "",
    ownRetainedEarningsPrev: "",
    ownCapital2Prev: "",
    ownRetainedEarnings2Prev: "",

    // Step 4: 類似業種データ
    industryStockPriceCurrent: "",  // 円
    industryStockPrice1MonthBefore: "",  // 円
    industryStockPrice2MonthsBefore: "",  // 円
    industryStockPricePrevYearAverage: "",  // 円
    industryDividendsYen: "",  // 円
    industryDividendsSen: "",  // 銭（小数点1位）
    industryProfit: "",  // 円
    industryBookValue: "",  // 円

    // Step 5: 純資産データ（千円）
    assetsBookValue: "",
    assetsInheritanceValue: "",
    liabilitiesBookValue: "",
    liabilitiesInheritanceValue: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIndustryChange = (type: IndustryType) => {
    setFormData(prev => ({ ...prev, industryType: type }));
  };

  const loadDummyData = (patternKey: DummyDataPatternKey) => {
    const pattern = DUMMY_DATA_PATTERNS[patternKey];
    setFormData({
      companyName: pattern.companyName,
      taxationPeriod: pattern.taxationPeriod,
      previousPeriod: pattern.previousPeriod,
      capital: pattern.capital.toString(),
      issuedShares: pattern.issuedShares.toString(),
      employees: pattern.employees.toString(),
      totalAssets: pattern.totalAssets.toString(),
      sales: pattern.sales.toString(),
      industryType: pattern.industryType,
      ownDividendPrev: pattern.ownDividendPrev.toString(),
      ownDividend2Prev: pattern.ownDividend2Prev.toString(),
      ownDividend3Prev: pattern.ownDividend3Prev.toString(),
      ownTaxableIncomePrev: pattern.ownTaxableIncomePrev.toString(),
      ownCarryForwardLossPrev: pattern.ownCarryForwardLossPrev.toString(),
      ownTaxableIncome2Prev: pattern.ownTaxableIncome2Prev.toString(),
      ownCarryForwardLoss2Prev: pattern.ownCarryForwardLoss2Prev.toString(),
      ownTaxableIncome3Prev: pattern.ownTaxableIncome3Prev.toString(),
      ownCarryForwardLoss3Prev: pattern.ownCarryForwardLoss3Prev.toString(),
      ownCapitalPrev: pattern.ownCapitalPrev.toString(),
      ownRetainedEarningsPrev: pattern.ownRetainedEarningsPrev.toString(),
      ownCapital2Prev: pattern.ownCapital2Prev.toString(),
      ownRetainedEarnings2Prev: pattern.ownRetainedEarnings2Prev.toString(),
      industryStockPriceCurrent: pattern.industryStockPriceCurrent.toString(),
      industryStockPrice1MonthBefore: pattern.industryStockPrice1MonthBefore.toString(),
      industryStockPrice2MonthsBefore: pattern.industryStockPrice2MonthsBefore.toString(),
      industryStockPricePrevYearAverage: pattern.industryStockPricePrevYearAverage.toString(),
      industryDividendsYen: pattern.industryDividendsYen.toString(),
      industryDividendsSen: pattern.industryDividendsSen.toString(),
      industryProfit: pattern.industryProfit.toString(),
      industryBookValue: pattern.industryBookValue.toString(),
      assetsBookValue: pattern.assetsBookValue.toString(),
      assetsInheritanceValue: pattern.assetsInheritanceValue.toString(),
      liabilitiesBookValue: pattern.liabilitiesBookValue.toString(),
      liabilitiesInheritanceValue: pattern.liabilitiesInheritanceValue.toString(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1: 基礎情報
    const capital = Number(formData.capital.replace(/,/g, ""));
    const issuedShares = Number(formData.issuedShares.replace(/,/g, ""));

    // Step 2: 会社規模（千円を円に変換）
    const employees = Number(formData.employees.replace(/,/g, ""));
    const totalAssets = Number(formData.totalAssets.replace(/,/g, "")) * 1000;
    const sales = Number(formData.sales.replace(/,/g, "")) * 1000;

    const { size, lRatio, sizeMultiplier } = calculateCompanySizeAndL({
      employees,
      sales,
      totalAssets,
      industryType: formData.industryType,
    });

    const basicInfo: BasicInfo = {
      companyName: formData.companyName,
      taxationPeriod: formData.taxationPeriod,
      previousPeriod: formData.previousPeriod,
      capital,
      issuedShares,
      employees,
      totalAssets,
      sales,
      industryType: formData.industryType,
      size,
      lRatio,
      sizeMultiplier,
    };

    // Step 3: 自社データの計算
    const capPrev = Number(formData.ownCapitalPrev) > 0 ? Number(formData.ownCapitalPrev) : capital;
    const shareCount50 = (capPrev * 1000) > 0 ? Math.floor((capPrev * 1000) / 50) : issuedShares;

    // 配当（b）
    const divPrev = Number(formData.ownDividendPrev);
    const div2Prev = Number(formData.ownDividend2Prev);
    const div3Prev = Number(formData.ownDividend3Prev);
    const avgDivTotal = ((divPrev + div2Prev) * 1000) / 2;
    const rawOwnDividends = avgDivTotal / shareCount50;
    const ownDividends = Math.floor(rawOwnDividends * 10) / 10;

    // 利益（c）
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

    // 純資産価額（d）
    const cap1 = Number(formData.ownCapitalPrev);
    const re1 = Number(formData.ownRetainedEarningsPrev);
    const cap2 = Number(formData.ownCapital2Prev);
    const re2 = Number(formData.ownRetainedEarnings2Prev);

    const netAssetPrev = (cap1 + re1) * 1000;
    const rawOwnBookValue = netAssetPrev / shareCount50;
    const ownBookValue = Math.floor(rawOwnBookValue);

    // Step 4: 類似業種データ
    const industryStockPriceCurrent = Number(formData.industryStockPriceCurrent);
    const industryStockPrice1MonthBefore = Number(formData.industryStockPrice1MonthBefore);
    const industryStockPrice2MonthsBefore = Number(formData.industryStockPrice2MonthsBefore);
    const industryStockPricePrevYearAverage = Number(formData.industryStockPricePrevYearAverage);

    const divYen = Number(formData.industryDividendsYen);
    const divSen = Number(formData.industryDividendsSen);
    const industryDividends = divYen + (divSen * 0.1);

    const industryProfit = Number(formData.industryProfit);
    const industryBookValue = Number(formData.industryBookValue);

    // Step 5: 純資産データ（千円を円に変換）
    const assetsBookValue = Number(formData.assetsBookValue) * 1000;
    const assetsInheritanceValue = formData.assetsInheritanceValue ? Number(formData.assetsInheritanceValue) * 1000 : undefined;
    const liabilitiesBookValue = Number(formData.liabilitiesBookValue) * 1000;
    const liabilitiesInheritanceValue = formData.liabilitiesInheritanceValue ? Number(formData.liabilitiesInheritanceValue) * 1000 : undefined;

    const financials: Financials = {
      // 自社データの結果
      ownDividends,
      ownProfit,
      ownBookValue,

      // 自社データの保存用
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

      // 類似業種データ
      industryStockPriceCurrent,
      industryStockPrice1MonthBefore,
      industryStockPrice2MonthsBefore,
      industryStockPricePrevYearAverage,
      industryDividends,
      industryProfit,
      industryBookValue,

      // 純資産データ
      assetsBookValue,
      assetsInheritanceValue,
      liabilitiesBookValue,
      liabilitiesInheritanceValue,
    };

    onSubmit(basicInfo, financials);
  };

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-primary">一覧入力</h2>
          <p className="text-muted-foreground mb-4">
            すべての情報を一度に入力してください。単位はステップバイステップと同じです。
          </p>

          {/* ダミーデータ読み込みボタン */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-amber-900">テスト用ダミーデータ</span>
              <span className="text-xs text-amber-700">（動作確認用のサンプルデータを自動入力）</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => loadDummyData("pattern1")}
                className="bg-white hover:bg-amber-100 border-amber-300 text-amber-900 font-bold"
              >
                パターン1: 中会社（製造業）
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => loadDummyData("pattern2")}
                className="bg-white hover:bg-amber-100 border-amber-300 text-amber-900 font-bold"
              >
                パターン2: 小会社（小売業）
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => loadDummyData("pattern3")}
                className="bg-white hover:bg-amber-100 border-amber-300 text-amber-900 font-bold"
              >
                パターン3: 大会社（卸売業）
              </Button>
            </div>
          </div>
        </div>

        {/* Step 1: 基礎情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b-2 border-primary pb-2">Step 1: 基礎情報</h3>

          <div className="space-y-2">
            <Label htmlFor="companyName">会社名</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="例: 株式会社サンプル"
              required
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
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capital">資本金等の額</Label>
              <div className="relative">
                <NumberInput
                  id="capital"
                  name="capital"
                  value={formData.capital}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="pr-12 text-right"
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
                  value={formData.issuedShares}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="pr-12 text-right"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">株</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: 会社規模 */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b-2 border-primary pb-2">Step 2: 会社規模</h3>

          <div className="space-y-2">
            <Label>業種区分</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleIndustryChange("Wholesale")}
                className={`p-3 rounded-lg border-2 transition-all font-bold ${
                  formData.industryType === "Wholesale"
                    ? "border-primary bg-white text-primary shadow-sm"
                    : "border-transparent bg-muted text-muted-foreground hover:bg-white hover:text-primary"
                }`}
              >
                卸売業
              </button>
              <button
                type="button"
                onClick={() => handleIndustryChange("RetailService")}
                className={`p-3 rounded-lg border-2 transition-all font-bold ${
                  formData.industryType === "RetailService"
                    ? "border-primary bg-white text-primary shadow-sm"
                    : "border-transparent bg-muted text-muted-foreground hover:bg-white hover:text-primary"
                }`}
              >
                小売・サービス業
              </button>
              <button
                type="button"
                onClick={() => handleIndustryChange("Other")}
                className={`p-3 rounded-lg border-2 transition-all font-bold ${
                  formData.industryType === "Other"
                    ? "border-primary bg-white text-primary shadow-sm"
                    : "border-transparent bg-muted text-muted-foreground hover:bg-white hover:text-primary"
                }`}
              >
                それ以外
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employees">従業員数</Label>
              <div className="relative">
                <NumberInput
                  id="employees"
                  name="employees"
                  value={formData.employees}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="pr-12 text-right"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">人</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalAssets">総資産価額（帳簿価額）</Label>
              <div className="relative">
                <NumberInput
                  id="totalAssets"
                  name="totalAssets"
                  value={formData.totalAssets}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="pr-12 text-right"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">千円</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales">直前期の売上高</Label>
              <div className="relative">
                <NumberInput
                  id="sales"
                  name="sales"
                  value={formData.sales}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="pr-12 text-right"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">千円</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: 自社データ */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b-2 border-primary pb-2">Step 3: 自社データ</h3>

          <div className="space-y-2">
            <Label>配当金額（千円）</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">直前期</Label>
                <div className="relative">
                  <NumberInput
                    name="ownDividendPrev"
                    value={formData.ownDividendPrev}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    className="pr-8 text-right"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">2期前</Label>
                <div className="relative">
                  <NumberInput
                    name="ownDividend2Prev"
                    value={formData.ownDividend2Prev}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    className="pr-8 text-right"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">3期前</Label>
                <div className="relative">
                  <NumberInput
                    name="ownDividend3Prev"
                    value={formData.ownDividend3Prev}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    className="pr-8 text-right"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>利益金額（千円）</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-center block">直前期</Label>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">利益</Label>
                  <div className="relative">
                    <NumberInput
                      name="ownTaxableIncomePrev"
                      value={formData.ownTaxableIncomePrev}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="pr-8 text-right"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">繰越欠損金</Label>
                  <div className="relative">
                    <NumberInput
                      name="ownCarryForwardLossPrev"
                      value={formData.ownCarryForwardLossPrev}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="pr-8 text-right"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-center block">2期前</Label>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">利益</Label>
                  <div className="relative">
                    <NumberInput
                      name="ownTaxableIncome2Prev"
                      value={formData.ownTaxableIncome2Prev}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="pr-8 text-right"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">繰越欠損金</Label>
                  <div className="relative">
                    <NumberInput
                      name="ownCarryForwardLoss2Prev"
                      value={formData.ownCarryForwardLoss2Prev}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="pr-8 text-right"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-center block">3期前</Label>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">利益</Label>
                  <div className="relative">
                    <NumberInput
                      name="ownTaxableIncome3Prev"
                      value={formData.ownTaxableIncome3Prev}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="pr-8 text-right"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">繰越欠損金</Label>
                  <div className="relative">
                    <NumberInput
                      name="ownCarryForwardLoss3Prev"
                      value={formData.ownCarryForwardLoss3Prev}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="pr-8 text-right"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>純資産価額（千円）</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-center block">直前期</Label>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">資本金</Label>
                  <div className="relative">
                    <NumberInput
                      name="ownCapitalPrev"
                      value={formData.ownCapitalPrev}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="pr-8 text-right"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">繰越利益剰余金</Label>
                  <div className="relative">
                    <NumberInput
                      name="ownRetainedEarningsPrev"
                      value={formData.ownRetainedEarningsPrev}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="pr-8 text-right"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-center block">2期前</Label>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">資本金</Label>
                  <div className="relative">
                    <NumberInput
                      name="ownCapital2Prev"
                      value={formData.ownCapital2Prev}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="pr-8 text-right"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">繰越利益剰余金</Label>
                  <div className="relative">
                    <NumberInput
                      name="ownRetainedEarnings2Prev"
                      value={formData.ownRetainedEarnings2Prev}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="pr-8 text-right"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">千円</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: 類似業種データ */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b-2 border-primary pb-2">Step 4: 類似業種データ</h3>

          <div className="space-y-2">
            <Label>A: 株価（円）</Label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">課税時期の月</Label>
                <div className="relative">
                  <NumberInput
                    name="industryStockPriceCurrent"
                    value={formData.industryStockPriceCurrent}
                    onChange={handleChange}
                    placeholder="0"
                    className="pr-8 text-right"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">前月</Label>
                <div className="relative">
                  <NumberInput
                    name="industryStockPrice1MonthBefore"
                    value={formData.industryStockPrice1MonthBefore}
                    onChange={handleChange}
                    placeholder="0"
                    className="pr-8 text-right"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">前々月</Label>
                <div className="relative">
                  <NumberInput
                    name="industryStockPrice2MonthsBefore"
                    value={formData.industryStockPrice2MonthsBefore}
                    onChange={handleChange}
                    placeholder="0"
                    className="pr-8 text-right"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">前年平均</Label>
                <div className="relative">
                  <NumberInput
                    name="industryStockPricePrevYearAverage"
                    value={formData.industryStockPricePrevYearAverage}
                    onChange={handleChange}
                    placeholder="0"
                    className="pr-8 text-right"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>B: 配当金額</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">円</Label>
                  <NumberInput
                    name="industryDividendsYen"
                    value={formData.industryDividendsYen}
                    onChange={handleChange}
                    placeholder="0"
                    className="text-right"
                  />
                </div>
                <div className="w-20">
                  <Label className="text-xs text-muted-foreground">銭</Label>
                  <NumberInput
                    name="industryDividendsSen"
                    value={formData.industryDividendsSen}
                    onChange={handleChange}
                    placeholder="0"
                    className="text-right"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industryProfit">C: 利益金額</Label>
              <div className="relative">
                <NumberInput
                  id="industryProfit"
                  name="industryProfit"
                  value={formData.industryProfit}
                  onChange={handleChange}
                  placeholder="0"
                  className="pr-8 text-right"
                />
                <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industryBookValue">D: 簿価純資産価額</Label>
              <div className="relative">
                <NumberInput
                  id="industryBookValue"
                  name="industryBookValue"
                  value={formData.industryBookValue}
                  onChange={handleChange}
                  placeholder="0"
                  className="pr-8 text-right"
                />
                <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">円</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5: 純資産データ */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b-2 border-primary pb-2">Step 5: 純資産データ</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4 p-4 rounded-lg bg-primary/5">
              <Label className="font-bold underline">資産の部（千円）</Label>
              <div className="space-y-2">
                <Label htmlFor="assetsInheritanceValue" className="text-sm font-bold">相続税評価額</Label>
                <div className="relative">
                  <NumberInput
                    id="assetsInheritanceValue"
                    name="assetsInheritanceValue"
                    value={formData.assetsInheritanceValue}
                    onChange={handleChange}
                    placeholder="0"
                    className="pr-12 text-right"
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
                    value={formData.assetsBookValue}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    className="pr-12 text-right"
                  />
                  <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">千円</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-lg bg-primary/5">
              <Label className="font-bold underline">負債の部（千円）</Label>
              <div className="space-y-2">
                <Label htmlFor="liabilitiesInheritanceValue" className="text-sm font-bold">相続税評価額</Label>
                <div className="relative">
                  <NumberInput
                    id="liabilitiesInheritanceValue"
                    name="liabilitiesInheritanceValue"
                    value={formData.liabilitiesInheritanceValue}
                    onChange={handleChange}
                    placeholder="0"
                    className="pr-12 text-right"
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
                    value={formData.liabilitiesBookValue}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    className="pr-12 text-right"
                  />
                  <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">千円</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="min-w-[200px]">
            評価額を算出
          </Button>
        </div>
      </form>
    </Card>
  );
}
