import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader2, LogOut, Plus } from "lucide-react";
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
interface Order {
  id: string;
  created_at: string;
  order_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  source: string;
  total: number;
  status: string;
  payment_status: string;
}
interface Subscriber {
  id: string;
  created_at: string;
  email: string;
  source: string;
}

function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
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

function OrdersTab() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary text-xs uppercase tracking-wider">
          <tr>
            <Th>Date</Th><Th>Ref</Th><Th>Customer</Th><Th>Address</Th>
            <Th>Source</Th><Th>Total</Th><Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No orders yet.</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <Td>{new Date(r.created_at).toLocaleString()}</Td>
                <Td className="font-mono text-xs">{r.order_ref}</Td>
                <Td>
                  <div>{r.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{r.customer_email}</div>
                  <div className="text-xs text-muted-foreground">{r.customer_phone}</div>
                </Td>
                <Td className="text-xs">
                  {r.address_street}<br />{r.address_city} {r.address_zip}
                </Td>
                <Td>{r.source}</Td>
                <Td>{formatPrice(Number(r.total))}</Td>
                <Td>
                  <span className="rounded-full bg-accent/30 px-2 py-1 text-xs font-semibold capitalize">
                    {r.status}
                  </span>
                  <div className="mt-1 text-xs text-muted-foreground capitalize">{r.payment_status}</div>
                </Td>
              </tr>
            ))
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
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
