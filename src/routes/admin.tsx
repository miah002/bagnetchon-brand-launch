import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listOrders, type Order } from "@/lib/orders";
import { listInquiries, type Inquiry } from "@/lib/inquiries";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  head: () =>
    pageMeta({
      title: "Admin",
      description: "Bagnetchon admin inbox.",
      path: "/admin",
    }),
  component: Admin,
});

// TODO(auth): replace this placeholder gate with real auth (Supabase + role check).
const PLACEHOLDER_PASSWORD = "bagnetchon";

interface Row {
  date: string;
  source: string;
  name: string;
  contact: string;
  type: "Order" | "Inquiry";
  message: string;
  status: "New" | "Contacted" | "Closed";
}

function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!authed) return;
    const orders: Order[] = listOrders();
    const inqs: Inquiry[] = listInquiries();
    const orderRows: Row[] = orders.map((o) => ({
      date: o.createdAt,
      source: o.source,
      name: o.customer.name,
      contact: o.customer.phone,
      type: "Order",
      message: `${o.lines.length} item(s) · $${o.total.toFixed(2)}`,
      status: "New",
    }));
    const inqRows: Row[] = inqs.map((i) => ({
      date: i.createdAt,
      source: i.source,
      name: i.name,
      contact: i.email,
      type: "Inquiry",
      message: `${i.guestCount} guests · ${i.eventDate} · ${i.location}`,
      status: "New",
    }));
    setRows([...orderRows, ...inqRows].sort((a, b) => b.date.localeCompare(a.date)));
  }, [authed]);

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 md:px-8">
        <h1 className="font-display text-3xl">Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Placeholder gate — full auth comes next.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pw === PLACEHOLDER_PASSWORD) setAuthed(true);
          }}
          className="mt-6 space-y-3"
        >
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-3"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <h1 className="font-display text-4xl">Inbox</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Local-only preview. Wire to database + email next.
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider">
            <tr>
              <Th>Date</Th><Th>Source</Th><Th>Name</Th><Th>Contact</Th>
              <Th>Type</Th><Th>Message</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No messages yet.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <Td>{new Date(r.date).toLocaleString()}</Td>
                  <Td>{r.source}</Td>
                  <Td>{r.name}</Td>
                  <Td>{r.contact}</Td>
                  <Td>{r.type}</Td>
                  <Td>{r.message}</Td>
                  <Td>
                    <span className="rounded-full bg-accent/30 px-2 py-1 text-xs font-semibold">
                      {r.status}
                    </span>
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}
