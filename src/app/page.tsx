"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleStepByStepClick = () => {
    // sessionStorageをクリア
    sessionStorage.removeItem('valuationBasicInfo');
    sessionStorage.removeItem('valuationFinancials');
    router.push('/valuation/step1');
  };

  const handleBulkInputClick = () => {
    // sessionStorageをクリア
    sessionStorage.removeItem('valuationBasicInfo');
    sessionStorage.removeItem('valuationFinancials');
    router.push('/valuation/bulk');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tight">
          株価<span className="text-secondary">P</span>OP
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          取引相場のない株式評価を、<br className="sm:hidden" />
          もっとかんたん、ポップに。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full px-4">
        <Card className="p-8 text-center space-y-6 border-4 border-secondary/20 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">ステップバイステップ</h2>
            <p className="text-sm text-muted-foreground">
              会社規模の判定から評価額の算出まで、<br />
              ステップ形式でガイド付きで進めます。
            </p>
          </div>

          <Button
            size="lg"
            className="w-full text-lg shadow-lg hover:shadow-xl transition-all"
            onClick={handleStepByStepClick}
          >
            スタート！
          </Button>
        </Card>

        <Card className="p-8 text-center space-y-6 border-4 border-primary/20 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">一覧入力</h2>
            <p className="text-sm text-muted-foreground">
              すべてのデータを一度に入力して、<br />
              素早く評価額を算出します。
            </p>
          </div>

          <Button
            size="lg"
            className="w-full text-lg shadow-lg hover:shadow-xl transition-all"
            onClick={handleBulkInputClick}
          >
            スタート！
          </Button>
        </Card>
      </div>
    </div>
  );
}
