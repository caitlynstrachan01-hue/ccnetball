import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion";
import { AdminOrders } from "@/components/admin-orders";
import { listShopOrders } from "@/lib/shop-admin.server";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin — Shop Orders",
  description: "Manage shop orders and mark them as shipped.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/orders");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.is_admin !== true) redirect("/account");

  const orders = await listShopOrders();

  return (
    <section className="border-b border-border/60 bg-muted/40">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Admin — shop orders
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Orders to <span className="gradient-text">ship</span>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Paid orders appear in &quot;To ship&quot; — paste the Australia Post
            tracking number and hit the button. A branded email with the right
            delivery time (6-10 or 2-4 business days) goes to the customer and
            BCCs you.
          </p>
        </Reveal>

        <div className="mt-8">
          <AdminOrders orders={orders} />
        </div>
      </div>
    </section>
  );
}
