// pages/admin/OrdersAdmin.tsx
import { useEffect, useMemo, useState } from "react";
import { listOrders, updateOrderStatus, getOrder } from "@/lib/adminApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

type OrderItem = {
  product: string;          // id
  optionId: string;
  name: string;
  optionName: string;
  img?: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  user: string | { _id: string; username?: string };
  items: OrderItem[];
  totals: { subtotal: number; shipping: number; grandTotal: number };
  status: "pending" | "paid" | "shipped" | "completed" | "canceled";
  payment?: { method?: string; transactionId?: string };
  shipping?: any;
  createdAt: string;
  updatedAt: string;
};

const STATUSES: Order["status"][] = ["pending", "paid", "shipped", "completed", "canceled"];

export default function OrdersAdmin() {
  const { language } = useLanguage();
  const L = (en: string, he: string) => (language === "he" ? he : en);
  const rtl = language === "he";

  const statusLabel = (s: Order["status"]) =>
    s === "pending"   ? L("pending", "ממתין") :
    s === "paid"      ? L("paid", "שולם") :
    s === "shipped"   ? L("shipped", "נשלח") :
    s === "completed" ? L("completed", "הושלם") :
                        L("canceled", "בוטל");

  const [rows, setRows] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const load = async () => setRows(await listOrders());
  useEffect(() => { load(); }, []);

  // username-only label, with ObjectId fallback when not populated
  const userLabel = (u: Order["user"]) => {
    if (!u) return "";
    if (typeof u === "string") {
      const s = String(u);
      return s.length > 12 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s;
    }
    return u.username || (u._id ? `${u._id.slice(0, 6)}…${u._id.slice(-4)}` : "");
  };

  // search: by order id, user label, status, or item name
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((o) => {
      const idHit = String(o._id).toLowerCase().includes(q);
      const userHit = userLabel(o.user).toLowerCase().includes(q);
      const statusHit = o.status.toLowerCase().includes(q);
      const itemsHit = (o.items || []).some((it) =>
        (it.name || "").toLowerCase().includes(q) ||
        (it.optionName || "").toLowerCase().includes(q)
      );
      return idHit || userHit || statusHit || itemsHit;
    });
  }, [rows, search]);

  async function openDetails(id: string) {
    const ord = await getOrder(id).catch(() => null);
    setSelected(ord || rows.find(r => r._id === id) || null);
    setOpen(true);
  }

  async function changeStatus(id: string, status: Order["status"]) {
    await updateOrderStatus(id, status);
    await load();
    if (selected && selected._id === id) setSelected({ ...selected, status });
  }

  function lineTotal(it: OrderItem) {
    return Number((it.price * it.quantity).toFixed(2));
  }

  return (
    <div className="space-y-4" dir={rtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{L("Orders", "הזמנות")}</h1>
        <Input
          placeholder={L("Search by username, order id, status, or item…", "חפש לפי משתמש, מזהה הזמנה, סטטוס או פריט…")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          aria-label={L("Search orders", "חיפוש הזמנות")}
        />
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{L("Order", "הזמנה")}</th>
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{L("User", "משתמש")}</th>
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{L("Items", "פריטים")}</th>
              <th className="p-2 text-right">{L("Total", "סה״כ")}</th>
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{L("Status", "סטטוס")}</th>
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{L("Actions", "פעולות")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr
                key={o._id}
                className="border-t hover:bg-muted/50 cursor-pointer"
                onClick={() => openDetails(o._id)}
              >
                <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{o._id.slice(-7)}</td>
                <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{userLabel(o.user)}</td>
                <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{o.items?.length || 0}</td>
                <td className="p-2 text-right">{o.totals?.grandTotal?.toFixed(2)}</td>
                <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={o.status}
                      onValueChange={(v) => changeStatus(o._id, v as Order["status"])}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={L("Select status", "בחר סטטוס")} />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </td>
                <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" onClick={() => openDetails(o._id)}>
                      {L("View", "צפה")}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className={`p-4 text-muted-foreground ${rtl ? "text-right" : "text-left"}`}>
                  {L("No orders", "אין הזמנות")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir={rtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>
              {L("Order", "הזמנה")} {selected?._id?.slice(-7)} • {selected && statusLabel(selected.status)}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              {/* Meta */}
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <div className="text-xs text-muted-foreground">{L("User", "משתמש")}</div>
                  <div className="font-medium">{userLabel(selected.user)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{L("Payment", "תשלום")}</div>
                  <div className="font-medium">
                    {selected.payment?.method || "—"}
                    {selected.payment?.transactionId ? ` • ${selected.payment.transactionId}` : ""}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{L("Placed", "נוצר בתאריך")}</div>
                  <div className="font-medium">
                    {new Date(selected.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Status control */}
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">{L("Status", "סטטוס")}</div>
                <Select
                  value={selected.status}
                  onValueChange={async (v) => {
                    setSaving(true);
                    await changeStatus(selected._id, v as Order["status"]);
                    setSaving(false);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Items */}
              <div className="border rounded overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{L("Item", "פריט")}</th>
                      <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{L("Option", "אפשרות")}</th>
                      <th className="p-2 text-right">{L("Price", "מחיר")}</th>
                      <th className="p-2 text-right">{L("Qty", "כמות")}</th>
                      <th className="p-2 text-right">{L("Total", "סה״כ")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.items.map((it, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">
                          <div className="flex items-center gap-3">
                            {it.img ? (
                              <img src={it.img} alt={it.name} className="h-12 w-12 object-cover rounded border" />
                            ) : (
                              <div className="h-12 w-12 rounded border bg-muted" />
                            )}
                            <div className="font-medium">{it.name}</div>
                          </div>
                        </td>
                        <td className="p-2">{it.optionName}</td>
                        <td className="p-2 text-right">{it.price.toFixed(2)}</td>
                        <td className="p-2 text-right">{it.quantity}</td>
                        <td className="p-2 text-right">{lineTotal(it).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals + Shipping */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{L("Shipping", "משלוח")}</div>
                  <div className="rounded border p-3 text-sm">
                    {selected.shipping ? (
                      <div className="space-y-1">
                        {selected.shipping.fullName && <div><span className="text-muted-foreground">{L("Name: ", "שם: ")}</span>{selected.shipping.fullName}</div>}
                        {selected.shipping.phone && <div><span className="text-muted-foreground">{L("Phone: ", "טלפון: ")}</span>{selected.shipping.phone}</div>}
                        <div>{[selected.shipping.addressLine1, selected.shipping.addressLine2].filter(Boolean).join(", ")}</div>
                        <div>{[selected.shipping.city, selected.shipping.postalCode, selected.shipping.country].filter(Boolean).join(", ")}</div>
                      </div>
                    ) : "—"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{L("Totals", "סיכומים")}</div>
                  <div className="rounded border p-3 text-sm space-y-1">
                    <div className="flex justify-between"><span>{L("Subtotal","סכום ביניים")}</span><span>{selected.totals.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>{L("Shipping","משלוח")}</span><span>{selected.totals.shipping.toFixed(2)}</span></div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>{L("Grand Total","סה״כ לתשלום")}</span><span>{selected.totals.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              {L("Close", "סגור")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
