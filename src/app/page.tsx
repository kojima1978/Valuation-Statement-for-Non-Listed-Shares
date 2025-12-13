import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function Home() {
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

      <Card className="p-8 max-w-md w-full text-center space-y-6 border-4 border-secondary/20 shadow-xl">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">評価をはじめる</h2>
          <p className="text-sm text-muted-foreground">
            会社規模の判定から評価額の算出まで、<br />
            ステップ形式で進めます。
          </p>
        </div>

        <Link href="/valuation" className="w-full">
          <Button size="lg" className="w-full text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            スタート！
          </Button>
        </Link>
      </Card>
    </div>
  );
}
