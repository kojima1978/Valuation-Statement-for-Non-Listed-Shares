"use client";

import { useState } from "react";
import { BasicInfo, Financials } from "@/types/valuation";
import { Step1BasicInfo } from "@/components/valuation/Step1BasicInfo";
import { Step2CompanySize } from "@/components/valuation/Step2CompanySize";
import { Step3OwnData } from "@/components/valuation/Step3OwnData";
import { Step4IndustryData } from "@/components/valuation/Step4IndustryData";
import { Step5NetAsset } from "@/components/valuation/Step5NetAsset";
import { Step6Result } from "@/components/valuation/Step6Result";
import { Step7Simulation } from "@/components/valuation/Step7Simulation";
import { cn } from "@/lib/utils";

// Inline Icon
const CheckIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const STEPS = [
    { title: "基礎情報", description: "会社情報" },
    { title: "規模判定", description: "資産・従業員" },
    { title: "自社データ", description: "配当・利益" },
    { title: "類似業種", description: "業界データ" },
    { title: "純資産", description: "資産・負債" },
    { title: "試算結果", description: "評価額算出" },
    { title: "シミュ", description: "利益0仮定" },
];

export default function ValuationPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
    const [financials, setFinancials] = useState<Financials | null>(null);

    const handleNextStep1 = (data: Partial<BasicInfo>) => {
        setBasicInfo((prev) => ({ ...prev, ...data } as BasicInfo));
        setCurrentStep(1);
        window.scrollTo(0, 0);
    };

    const handleNextStep2 = (data: Partial<BasicInfo>) => {
        setBasicInfo((prev) => ({ ...prev, ...data } as BasicInfo));
        setCurrentStep(2);
        window.scrollTo(0, 0);
    };

    const handleNextStep3 = (data: Partial<Financials>) => {
        setFinancials((prev) => ({ ...prev, ...data } as Financials));
        setCurrentStep(3);
        window.scrollTo(0, 0);
    };

    const handleNextStep4 = (data: Partial<Financials>) => {
        setFinancials((prev) => ({ ...prev, ...data } as Financials));
        setCurrentStep(4);
        window.scrollTo(0, 0);
    };

    const handleNextStep5 = (data: Partial<Financials>) => {
        setFinancials((prev) => ({ ...prev, ...data } as Financials));
        setCurrentStep(5);
        window.scrollTo(0, 0);
    };

    const handleNextStep6 = () => {
        setCurrentStep(6);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(0, prev - 1));
        window.scrollTo(0, 0);
    };

    const handleStepClick = (index: number) => {
        // Can always go back
        if (index <= currentStep) {
            setCurrentStep(index);
            window.scrollTo(0, 0);
            return;
        }

        // Validate forward navigation
        // Step 1 check
        if (index > 0 && !(basicInfo?.companyName && basicInfo?.issuedShares)) return;
        // Step 2 check
        if (index > 1 && !(basicInfo?.size && basicInfo?.lRatio !== undefined)) return;
        // Step 3 check (Own Data) - Check ownDividends exists
        if (index > 2 && financials?.ownDividends === undefined) return;
        // Step 4 check (Industry Data) - Check industryStockPriceCurrent or others
        if (index > 3 && financials?.industryDividends === undefined) return;
        // Step 5 check (Net Asset) - Check assetsBookValue
        if (index > 4 && financials?.assetsBookValue === undefined) return;

        setCurrentStep(index);
        window.scrollTo(0, 0);
    };

    return (
        <div className="space-y-8 py-8">
            {/* Stepper */}
            <div className="relative">
                <div className="absolute top-5 left-0 w-full h-1 bg-muted -z-10" />
                <div
                    className="absolute top-5 left-0 h-1 bg-primary transition-all duration-500 -z-10"
                    style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />

                <div className="flex justify-between">
                    {STEPS.map((step, index) => {
                        const isCompleted = currentStep > index;
                        const isCurrent = currentStep === index;

                        // Determine if clickable (simplified logic reusing handleStepClick checks would be better but explicit here for visual state)
                        let isClickable = index <= currentStep;
                        if (index === 1 && basicInfo?.companyName) isClickable = true;
                        if (index === 2 && basicInfo?.size) isClickable = true;
                        if (index === 3 && financials?.ownDividends !== undefined) isClickable = true;
                        if (index === 4 && financials?.industryDividends !== undefined) isClickable = true;
                        if (index === 5 && financials?.assetsBookValue !== undefined) isClickable = true;
                        if (index === 6 && currentStep === 6) isClickable = true;

                        return (
                            <button
                                key={index}
                                onClick={() => isClickable && handleStepClick(index)}
                                className={cn(
                                    "flex flex-col items-center gap-2 group focus:outline-none",
                                    isClickable ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-50"
                                )}
                                disabled={!isClickable}
                            >
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 bg-background font-bold",
                                        isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                            isCurrent ? "border-primary text-primary scale-110" :
                                                "border-muted text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? <CheckIcon className="w-6 h-6" /> : index + 1}
                                </div>
                                <div className="text-center hidden sm:block">
                                    <p className={cn("text-sm font-bold transition-colors", isCurrent ? "text-primary" : "text-muted-foreground")}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{step.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {currentStep === 0 && (
                    <Step1BasicInfo
                        onNext={handleNextStep1}
                        defaultValues={basicInfo || undefined}
                    />
                )}

                {currentStep === 1 && (
                    <Step2CompanySize
                        onNext={handleNextStep2}
                        onBack={handleBack}
                        defaultValues={basicInfo || undefined}
                    />
                )}

                {currentStep === 2 && basicInfo && (
                    <Step3OwnData
                        basicInfo={basicInfo}
                        onNext={handleNextStep3}
                        onBack={handleBack}
                        defaultValues={financials || undefined}
                    />
                )}

                {currentStep === 3 && basicInfo && (
                    <Step4IndustryData
                        basicInfo={basicInfo}
                        onNext={handleNextStep4}
                        onBack={handleBack}
                        defaultValues={financials || undefined}
                    />
                )}

                {currentStep === 4 && basicInfo && (
                    <Step5NetAsset
                        basicInfo={basicInfo}
                        onNext={handleNextStep5}
                        onBack={handleBack}
                        defaultValues={financials || undefined}
                    />
                )}

                {currentStep === 5 && basicInfo && financials && (
                    <Step6Result
                        basicInfo={basicInfo}
                        financials={financials}
                        onBack={handleBack}
                        onNext={handleNextStep6}
                    />
                )}

                {currentStep === 6 && basicInfo && financials && (
                    <Step7Simulation
                        basicInfo={basicInfo}
                        financials={financials}
                        onBack={handleBack}
                    />
                )}
            </div>
        </div>
    );
}
