import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ChevronDown, ChevronRight, Loader2, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SOURCE_OPTIONS } from "@/lib/source";
import { pageMeta } from "@/lib/seo";
import { formatPrice } from "@/context/CartContext";

export const Route = createFileRoute("/admin")({
  head: () =>
    pageMeta({
      title: "Admin",
      description: "Bagnetchon admin inbox.",
      path: "/admin",
    }),
  component: Admin,
});

type Tab = "inquiries" | "orders" | "subscribers";
type Status = "new" | "contacted" | "closed";

interface Inquiry {
  id: string;
  created_at: string;
  type: string;
  source: string;
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  guest_count: number | null;
  location: string | null;
  package: string | null;
  message: string | null;
  status: Status;
}
type OrderStatus = "pending" | "confirmed" | "ready" | "completed" | "cancelled" | "paid";

interface OrderItem {
  id: string;
  qty: number;
  lineTotal: number;
  item: { name: string; price: number | null };
}

interface Order {
  id: string;
  created_at: string;
  order_ref: string;
  fulfillment: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  source: string;
  items: OrderItem[] | null;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  delivery_miles: number | null;
  total: number;
  status: OrderStatus;
  payment_status: string;
}
interface Subscriber {
  id: string;
  created_at: string;
  email: string;
  source: string;
}

const ADMIN_EMAILS: string[] = ((import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? "")
  .split(",").map((e) => e.trim()).filter(Boolean);

function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const isAllowed = (s: Session | null) =>
      !s || ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(s.user.email ?? "");

    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (!isAllowed(s)) {
        supabase.auth.signOut();
        setUnauthorized(true);
      } else {
        setSession(s);
      }
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!isAllowed(s)) {
        supabase.auth.signOut();
        setUnauthorized(true);
        setSession(null);
      } else {
        setSession(s);
        setUnauthorized(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (unauthorized) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center md:px-8">
        <h1 className="font-display text-3xl">Unauthorized</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account does not have admin access.
        </p>
        <button
          onClick={() => { setUnauthorized(false); }}
          className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to sign in
        </button>
      </div>
    );
  }
  if (!session) return <LoginCard />;
  return <Inbox onSignOut={() => supabase.auth.signOut()} email={session.user.email ?? ""} />;
}

function LoginCard() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) setErr(error.message);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 md:px-8">
      <h1 className="font-display text-4xl">Admin sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Owner access only — public sign-ups are disabled.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-6 shadow-ambient">
        <div>
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5"
          />
        </div>
        <div>
          <label htmlFor="pw" className="text-sm font-medium">Password</label>
          <input
            id="pw"
            type="password"
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5"
          />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="btn-sheen inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>
      <div className="mt-6 rounded-xl bg-secondary p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">First time?</p>
        <p className="mt-1">
          Create your admin account from the backend dashboard:
          open <strong>Cloud → Users → Add user</strong>, set an email +
          password, then sign in here. Public sign-up is intentionally off
          so only the owner can reach this inbox.
        </p>
      </div>
    </div>
  );
}

function Inbox({ onSignOut, email }: { onSignOut: () => void; email: string }) {
  const [tab, setTab] = useState<Tab>("inquiries");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {email}</p>
        </div>
        <button
          onClick={onSignOut}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      <div role="tablist" className="mt-8 inline-flex gap-1 rounded-full border border-border bg-card p-1">
        {(["inquiries", "orders", "subscribers"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "inquiries" && <InquiriesTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "subscribers" && <SubscribersTab />}
      </div>
    </div>
  );
}

function InquiriesTab() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState<string>("All");
  const [st, setSt] = useState<string>("All");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as Inquiry[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (src === "All" || r.source === src) &&
          (st === "All" || r.status === st),
      ),
    [rows, src, st],
  );

  const setStatus = async (id: string, status: Status) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    await supabase.from("inquiries").update({ status }).eq("id", id);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select value={src} onChange={(e) => setSrc(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option>All</option>
          {SOURCE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={st} onChange={(e) => setSt(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option>All</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Add inquiry manually
          </button>
        </div>
      </div>

      {adding && (
        <ManualInquiryForm
          onClose={() => setAdding(false)}
          onSaved={async () => {
            setAdding(false);
            await load();
          }}
        />
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider">
            <tr>
              <Th>Date</Th><Th>Source</Th><Th>Type</Th><Th>Name</Th>
              <Th>Contact</Th><Th>Event</Th><Th>Message</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No inquiries yet.</td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <Td>{new Date(r.created_at).toLocaleString()}</Td>
                  <Td>{r.source}</Td>
                  <Td className="capitalize">{r.type}</Td>
                  <Td>{r.name}</Td>
                  <Td>
                    <div>{r.email}</div>
                    {r.phone && <div className="text-xs text-muted-foreground">{r.phone}</div>}
                  </Td>
                  <Td>
                    {r.event_date && <div>{r.event_date}</div>}
                    {r.guest_count != null && <div className="text-xs">{r.guest_count} guests</div>}
                    {r.location && <div className="text-xs text-muted-foreground">{r.location}</div>}
                    {r.package && <div className="text-xs text-primary">{r.package}</div>}
                  </Td>
                  <Td className="max-w-[24rem]">
                    <div className="line-clamp-3 text-xs">{r.message ?? "—"}</div>
                  </Td>
                  <Td>
                    <select
                      aria-label="Status"
                      value={r.status}
                      onChange={(e) => setStatus(r.id, e.target.value as Status)}
                      className="rounded-full border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ManualInquiryForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    source: "Facebook",
    type: "contact" as "contact" | "catering",
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await supabase.from("inquiries").insert({
      source: f.source,
      type: f.type,
      name: f.name,
      email: f.email || `${f.source.toLowerCase()}-dm@bagnetchon.local`,
      phone: f.phone || null,
      message: f.message || null,
    });
    setBusy(false);
    onSaved();
  };

  return (
    <form
      onSubmit={submit}
      className="mt-4 grid gap-3 rounded-2xl border border-primary/30 bg-card p-4 shadow-ambient md:grid-cols-3"
    >
      <select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
        {SOURCE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
      </select>
      <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as "contact" | "catering" })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
        <option value="contact">Contact</option>
        <option value="catering">Catering</option>
      </select>
      <input required placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      <input type="email" placeholder="Email (optional)" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      <input placeholder="Phone (optional)" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      <textarea placeholder="Message / details" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm md:col-span-3" rows={3} />
      <div className="flex gap-2 md:col-span-3">
        <button type="submit" disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? "Saving…" : "Save inquiry"}
        </button>
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "ready", "completed", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  ready: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function OrdersTab() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as Order[]) ?? []);
        setLoading(false);
      });
  }, []);

  const setStatus = async (id: string, status: OrderStatus) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    await supabase.from("orders").update({ status }).eq("id", id);
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary text-xs uppercase tracking-wider">
          <tr>
            <Th></Th><Th>Date</Th><Th>Ref</Th><Th>Customer</Th><Th>Fulfillment</Th>
            <Th>Total</Th><Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No orders yet.</td></tr>
          ) : (
            rows.map((r) => {
              const expanded = expandedId === r.id;
              return (
                <React.Fragment key={r.id}>
                  <tr
                    className="cursor-pointer border-t border-border hover:bg-muted/40"
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                  >
                    <Td>
                      {expanded
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </Td>
                    <Td className="whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</Td>
                    <Td className="font-mono text-xs">{r.order_ref}</Td>
                    <Td>
                      <div className="font-medium">{r.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{r.customer_email}</div>
                      <div className="text-xs text-muted-foreground">{r.customer_phone}</div>
                    </Td>
                    <Td className="capitalize">{r.fulfillment ?? "delivery"}</Td>
                    <Td className="font-semibold">{formatPrice(Number(r.total))}</Td>
                    <Td onClick={(e) => e.stopPropagation()}>
                      <select
                        aria-label="Order status"
                        value={r.status}
                        onChange={(e) => setStatus(r.id, e.target.value as OrderStatus)}
                        className={`rounded-full border-0 px-2 py-1 text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-ring ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-800"}`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-background text-foreground">{s}</option>
                        ))}
                      </select>
                    </Td>
                  </tr>
                  {expanded && (
                    <tr key={`${r.id}-detail`} className="border-t border-border bg-secondary/40">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Items */}
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Items ordered</p>
                            {(r.items ?? []).length === 0 ? (
                              <p className="text-xs text-muted-foreground">No items recorded.</p>
                            ) : (
                              <ul className="space-y-1">
                                {(r.items ?? []).map((line, i) => (
                                  <li key={i} className="flex justify-between text-sm">
                                    <span>{line.qty} × {line.item?.name ?? "Item"}</span>
                                    <span className="font-medium">{formatPrice(Number(line.lineTotal ?? 0))}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          {/* Breakdown + address */}
                          <div className="space-y-3">
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Price breakdown</p>
                              <dl className="space-y-0.5 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Subtotal</dt>
                                  <dd>{formatPrice(Number(r.subtotal))}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Tax (7.75%)</dt>
                                  <dd>{formatPrice(Number(r.tax))}</dd>
                                </div>
                                {Number(r.delivery_fee) > 0 && (
                                  <div className="flex justify-between">
                                    <dt className="text-muted-foreground">
                                      Delivery fee
                                      {r.delivery_miles != null && ` (${r.delivery_miles.toFixed(1)} mi)`}
                                    </dt>
                                    <dd>{formatPrice(Number(r.delivery_fee))}</dd>
                                  </div>
                                )}
                                <div className="flex justify-between border-t border-border pt-1 font-semibold">
                                  <dt>Total</dt>
                                  <dd>{formatPrice(Number(r.total))}</dd>
                                </div>
                              </dl>
                            </div>
                            {r.fulfillment === "delivery" && r.address_street && (
                              <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Delivery address</p>
                                <p className="text-sm">{r.address_street}</p>
                                <p className="text-sm">{r.address_city} {r.address_zip}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function SubscribersTab() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as Subscriber[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary text-xs uppercase tracking-wider">
          <tr><Th>Date</Th><Th>Email</Th><Th>Source</Th></tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">No subscribers yet.</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <Td>{new Date(r.created_at).toLocaleString()}</Td>
                <Td>{r.email}</Td>
                <Td>{r.source}</Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3">{children}</th>;
}
function Td({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }) {
  return <td className={`px-4 py-3 align-top ${className}`} onClick={onClick}>{children}</td>;
}
