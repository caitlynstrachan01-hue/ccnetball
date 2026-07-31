import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Crown, Package, ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/motion";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { SHOP_PRODUCTS } from "@/lib/shop-content";

export const metadata = {
  title: "My Account",
  description: "Your CC Netball account and subscriptions.",
};

type Entitlement = {
  product_slug: string;
  expires_at: string | null;
  tier: string | null;
  status: string;
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.is_admin === true;

  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("product_slug, expires_at, tier, status")
    .eq("user_id", user.id)
    .eq("status", "active");

  const activeEntitlements: Entitlement[] = entitlements ?? [];

  const productsWithAccess = SHOP_PRODUCTS.map((product) => {
    const entitlement = activeEntitlements.find(
      (e) => e.product_slug === product.slug,
    );
    const hasAccess = isAdmin || Boolean(entitlement);
    return { product, hasAccess, entitlement };
  });

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 size-[35rem] rounded-full bg-[var(--brand-coral)]/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            My account
          </p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                {profile?.full_name
                  ? `Welcome back, ${profile.full_name.split(" ")[0]}`
                  : "Welcome back"}
                <span className="gradient-text">.</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground">
                Signed in as <strong>{user.email}</strong>
              </p>
              {isAdmin && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  <Crown className="size-3.5" />
                  Admin — unlimited access to all products
                </div>
              )}
            </div>
            <SignOutButton />
          </div>
        </Reveal>

        <Reveal delay={0.05} className="mt-12">
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Your subscriptions
          </h2>
        </Reveal>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {productsWithAccess.map(({ product, hasAccess, entitlement }) => (
            <Reveal key={product.slug} delay={0.05}>
              <article className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-lg font-bold leading-snug">
                    {product.name}
                  </h3>
                  {hasAccess ? (
                    <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      Active
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Not subscribed
                    </span>
                  )}
                </div>

                {hasAccess && entitlement?.expires_at && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Access until{" "}
                    {new Date(entitlement.expires_at).toLocaleDateString(
                      "en-AU",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                    {entitlement.tier ? ` · ${entitlement.tier}` : ""}
                  </p>
                )}
                {hasAccess && isAdmin && !entitlement && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Unlimited — via admin account
                  </p>
                )}

                {hasAccess ? (
                  <Link
                    href={`/shop/tools/${product.slug}`}
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary transition hover:gap-3"
                  >
                    <Package className="size-4" />
                    Open the app <ArrowRight className="size-3.5" />
                  </Link>
                ) : (
                  <Link
                    href={`/shop/${product.slug}`}
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-muted-foreground transition hover:text-primary"
                  >
                    <ShoppingBag className="size-4" />
                    See in the shop <ArrowRight className="size-3.5" />
                  </Link>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
