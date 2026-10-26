import Link from "next/link";
import { ShoppingBag, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion";
import { GreetingCardMockup } from "@/components/greeting-card-mockup";
import {
  type PhysicalProduct,
  formatPriceCents,
  isGreetingCardProduct,
  isWallChartProduct,
  stockMessage,
} from "@/lib/shop-physical";

export function PhysicalProductsGrid({
  products,
}: {
  products: PhysicalProduct[];
}) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-border/70 bg-card p-10 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          Store products are being set up — check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {products.map((product, i) => {
        const stockInfo = stockMessage(product.stock);
        const soldOut = product.stock <= 0;
        const photo = product.photos[0] ?? null;
        const isCard = isGreetingCardProduct(product.slug);
        const isWallChart = isWallChartProduct(product.slug);
        return (
          <Reveal key={product.id} delay={0.05 + i * 0.04}>
            <Link
              href={`/shop/${product.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
            >
              <div
                className={`relative flex items-center justify-center overflow-hidden bg-muted ${
                  isCard
                    ? "aspect-[4/3] p-5"
                    : isWallChart
                      ? "aspect-[3/4] p-4"
                      : "aspect-square"
                }`}
              >
                {photo ? (
                  isCard ? (
                    <GreetingCardMockup
                      src={photo}
                      alt={product.name}
                      size="sm"
                    />
                  ) : isWallChart ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={product.name}
                      className="max-h-full w-auto object-contain shadow-md transition-transform group-hover:scale-[1.03]"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ShoppingBag className="size-10" />
                    <p className="text-[10px] uppercase tracking-[0.2em]">
                      Photo soon
                    </p>
                  </div>
                )}
                {product.isLimitedEdition && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--brand-raspberry)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    <Sparkles className="size-3" /> Limited
                  </span>
                )}
                {soldOut && (
                  <span className="absolute right-3 top-3 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-background">
                    Sold out
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base font-bold leading-snug">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {product.short}
                </p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="font-display text-lg font-extrabold text-primary">
                      {formatPriceCents(product.priceCents)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      + postage
                    </p>
                  </div>
                  {stockInfo.message && !soldOut && (
                    <p className="text-[11px] font-semibold text-[var(--brand-raspberry)]">
                      {stockInfo.message}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
