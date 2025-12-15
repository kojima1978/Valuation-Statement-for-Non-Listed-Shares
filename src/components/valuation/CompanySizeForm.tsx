import { useState } from "react";
import { calculateCompanySizeAndL, IndustryType } from "@/lib/valuation-logic";
import { BasicInfo } from "@/types/valuation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";

interface CompanySizeFormProps {
    onNext: (data: Partial<BasicInfo>) => void;
    onBack: () => void;
    defaultValues?: Partial<BasicInfo>;
}

export function CompanySizeForm({ onNext, onBack, defaultValues }: CompanySizeFormProps) {
    const [formData, setFormData] = useState({
        employees: defaultValues?.employees?.toString() || "",
        totalAssets: defaultValues?.totalAssets ? (defaultValues.totalAssets / 1000).toString() : "",
        sales: defaultValues?.sales ? (defaultValues.sales / 1000).toString() : "",
        industryType: defaultValues?.industryType as IndustryType || "Wholesale",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleIndustryChange = (type: IndustryType) => {
        setFormData((prev) => ({ ...prev, industryType: type }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Parse numbers (remove commas) and convert units (Thousands -> Yen)
        const employees = Number(formData.employees.replace(/,/g, ""));
        const totalAssets = Number(formData.totalAssets.replace(/,/g, "")) * 1000;
        const sales = Number(formData.sales.replace(/,/g, "")) * 1000;

        if (employees < 0) {
            alert("従業員数は0人以上の数値を入力してください。");
            return;
        }

        // Calculate Size
        const { size, lRatio, sizeMultiplier } = calculateCompanySizeAndL({
            employees,
            sales,
            totalAssets,
            industryType: formData.industryType,
        });

        onNext({
            employees,
            totalAssets,
            sales,
            industryType: formData.industryType,
            size,
            lRatio,
            sizeMultiplier,
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-primary">会社規模の判定 (Step 2/6)</h2>
                <p className="text-muted-foreground">「資産・従業員」と「売上高」から会社規模とL割合を判定します。</p>
            </div>

            <Card className="p-6 border-secondary/20 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-blue-300">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">✎</div>
                                <h3 className="text-lg font-bold text-blue-900">入力：会社規模判定データ</h3>
                            </div>

                            <div className="space-y-2">
                                <Label>業種区分</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleIndustryChange("Wholesale")}
                                        className={`p-3 rounded-lg border-2 transition-all font-bold ${formData.industryType === "Wholesale"
                                            ? "border-primary bg-white text-primary shadow-sm"
                                            : "border-transparent bg-white/50 text-muted-foreground hover:bg-white hover:text-primary"
                                            }`}
                                    >
                                        卸売業
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleIndustryChange("RetailService")}
                                        className={`p-3 rounded-lg border-2 transition-all font-bold ${formData.industryType === "RetailService"
                                            ? "border-primary bg-white text-primary shadow-sm"
                                            : "border-transparent bg-white/50 text-muted-foreground hover:bg-white hover:text-primary"
                                            }`}
                                    >
                                        小売・サービス業
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleIndustryChange("Other")}
                                        className={`p-3 rounded-lg border-2 transition-all font-bold ${formData.industryType === "Other"
                                            ? "border-primary bg-white text-primary shadow-sm"
                                            : "border-transparent bg-white/50 text-muted-foreground hover:bg-white hover:text-primary"
                                            }`}
                                    >
                                        それ以外
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="employees">従業員数</Label>
                                    <div className="relative">
                                        <NumberInput
                                            id="employees"
                                            name="employees"
                                            placeholder="0"
                                            value={formData.employees}
                                            onChange={handleChange}
                                            required
                                            className="pr-12 text-right bg-white"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">人</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="totalAssets">総資産価額 (帳簿価額)</Label>
                                    <div className="relative">
                                        <NumberInput
                                            id="totalAssets"
                                            name="totalAssets"
                                            placeholder="0"
                                            value={formData.totalAssets}
                                            onChange={handleChange}
                                            required
                                            className="pr-12 text-right bg-white"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">千円</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sales">直前期の売上高</Label>
                                    <div className="relative">
                                        <NumberInput
                                            id="sales"
                                            name="sales"
                                            placeholder="0"
                                            value={formData.sales}
                                            onChange={handleChange}
                                            required
                                            className="pr-12 text-right bg-white"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">千円</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Real-time Result Preview */}
                        <div className="bg-green-50 p-4 rounded-xl border-2 border-green-300">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
                                <h3 className="text-sm font-bold text-green-900">計算結果：判定結果 (リアルタイムプレビュー)</h3>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">会社規模区分</p>
                                    <p className="text-2xl font-black text-primary">
                                        {(() => {
                                            const emp = Number(formData.employees.replace(/,/g, ""));
                                            const assets = Number(formData.totalAssets.replace(/,/g, "")) * 1000;
                                            const sales = Number(formData.sales.replace(/,/g, "")) * 1000;
                                            const { size } = calculateCompanySizeAndL({
                                                employees: emp,
                                                totalAssets: assets,
                                                sales: sales,
                                                industryType: formData.industryType
                                            });
                                            if (size === "Big") return "大会社";
                                            if (size === "Medium") return "中会社";
                                            return "小会社";
                                        })()}
                                    </p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-sm text-muted-foreground">Lの割合 / 斟酌率</p>
                                    <div className="text-right">
                                        {(() => {
                                            const emp = Number(formData.employees.replace(/,/g, ""));
                                            const assets = Number(formData.totalAssets.replace(/,/g, "")) * 1000;
                                            const sales = Number(formData.sales.replace(/,/g, "")) * 1000;
                                            const { size, lRatio, sizeMultiplier } = calculateCompanySizeAndL({
                                                employees: emp,
                                                totalAssets: assets,
                                                sales: sales,
                                                industryType: formData.industryType
                                            });

                                            return (
                                                <>
                                                    <p className="text-2xl font-black text-primary">L = {lRatio.toFixed(2)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        (斟酌率: {sizeMultiplier})
                                                    </p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onBack} size="lg" className="flex-1">
                            戻る
                        </Button>
                        <Button type="submit" size="lg" className="flex-1 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                            次へ進む
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
