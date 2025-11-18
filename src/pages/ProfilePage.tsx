// src/pages/ProfilePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { api, getToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type OrderItem = {
  product: string;
  optionId: string;
  name: string;
  optionName: string;
  img?: string;
  price: number;
  quantity: number;
};
type Order = {
  _id: string;
  items: OrderItem[];
  totals: { subtotal: number; shipping: number; grandTotal: number };
  status: "pending" | "paid" | "shipped" | "completed" | "canceled";
  createdAt: string;
};

type OrderFull = Order & {
  payment?: { method?: "cod" | "card" | "paypal"; transactionId?: string | null };
  shipping?: {
    fullName?: string; phone?: string;
    addressLine1?: string; addressLine2?: string;
    city?: string; postalCode?: string; country?: string;
  };
};

export default function ProfilePage() {
  const { user, loading, setUser } = useAuth();
  const { language } = useLanguage();

  // i18n helpers
  const L = (en: string, he: string) => (language === "he" ? he : en);
  const locale = language === "he" ? "he-IL" : "en-US";

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState(""); // confirm
  const [saving, setSaving] = useState(false);

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<OrderFull | null>(null);
  const [loadingOne, setLoadingOne] = useState(false);

  const token = useMemo(() => getToken(), []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;
    const run = async () => {
      setOrdersLoading(true);
      try {
        const r = await api.get("/orders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(r.data as Order[]);
      } catch (e: any) {
        toast.error(
          e?.response?.data?.error ||
            L("Failed to load orders", "נכשל בטעינת ההזמנות")
        );
      } finally {
        setOrdersLoading(false);
      }
    };
    run();
  }, [token, language]); // rerender to localize toasts if needed

  const pwTrim = password.trim();
  const pw2Trim = password2.trim();
  const pwMismatch = pwTrim.length > 0 && pwTrim !== pw2Trim;

  async function onSave() {
    if (!token) {
      toast.error(L("Not authenticated", "לא מחובר"));
      return;
    }

    if (pwMismatch) {
      toast.error(L("Passwords do not match", "הסיסמאות אינן תואמות"));
      return;
    }

    setSaving(true);
    try {
      const body: any = { name, username };
      if (pwTrim) body.password = pwTrim;

      const r = await api.put("/auth/me", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (r.data?.user) setUser(r.data.user);
      toast.success(L("Profile updated", "הפרופיל עודכן"));
      setPassword("");
      setPassword2("");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.error || L("Update failed", "העדכון נכשל")
      );
    } finally {
      setSaving(false);
    }
  }

  async function openOrder(orderId: string) {
    if (!token) return;
    setLoadingOne(true);
    try {
      const r = await api.get(`/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelected(r.data as OrderFull);
      setOpen(true);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.error || L("Failed to load order", "נכשל בטעינת ההזמנה")
      );
    } finally {
      setLoadingOne(false);
    }
  }

  if (loading) return null;

  return (
    <div className="container mx-auto max-w-5xl px-4 pt-20 pb-8">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-md">
          <TabsTrigger value="account">{L("Account", "חשבון")}</TabsTrigger>
          <TabsTrigger value="orders">{L("Orders", "הזמנות")}</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{L("Update Profile", "עדכון פרופיל")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{L("Name", "שם")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">{L("Username", "שם משתמש")}</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{L("New Password", "סיסמה חדשה")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={L("Leave blank to keep current", "השאר ריק כדי לא לשנות")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password2">
                  {L("Confirm New Password", "אישור סיסמה חדשה")}
                </Label>
                <Input
                  id="password2"
                  type="password"
                  placeholder={L("Re-enter new password", "הקלד שוב את הסיסמה")}
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                />
                {pwMismatch && (
                  <p className="text-xs text-destructive">
                    {L("Passwords do not match.", "הסיסמאות אינן תואמות.")}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={onSave} disabled={saving || pwMismatch}>
                {saving ? L("Saving...", "שומר...") : L("Save changes", "שמור שינויים")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{L("My Orders", "ההזמנות שלי")}</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <p>{L("Loading…", "טוען…")}</p>
              ) : !orders?.length ? (
                <p>{L("No orders yet.", "אין הזמנות עדיין.")}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{L("ID", "מזהה")}</TableHead>
                      <TableHead>{L("Date", "תאריך")}</TableHead>
                      <TableHead>{L("Status", "סטטוס")}</TableHead>
                      <TableHead>{L("Items", "פריטים")}</TableHead>
                      <TableHead className="text-right">{L("Total", "סך הכול")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow
                        key={o._id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => openOrder(o._id)}
                        onKeyDown={(e) => e.key === "Enter" && openOrder(o._id)}
                        tabIndex={0}
                        role="button"
                        aria-label={L(`Open order ${o._id}`, `פתח הזמנה ${o._id}`)}
                      >
                        <TableCell className="font-mono text-xs">{o._id}</TableCell>
                        <TableCell>{new Date(o.createdAt).toLocaleString(locale)}</TableCell>
                        <TableCell className="capitalize">{o.status}</TableCell>
                        <TableCell>{o.items.reduce((s, i) => s + i.quantity, 0)}</TableCell>
                        <TableCell className="text-right">₪ {o.totals.grandTotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order details dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {L("Order", "הזמנה")}{" "}
              {selected?._id && <span className="font-mono text-xs">#{selected._id}</span>}
            </DialogTitle>
          </DialogHeader>

          {loadingOne ? (
            <p>{L("Loading…", "טוען…")}</p>
          ) : !selected ? (
            <p>{L("No data.", "אין נתונים.")}</p>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="capitalize">{selected.status}</Badge>
                <span>{new Date(selected.createdAt).toLocaleString(locale)}</span>
                <span>•</span>
                <span>
                  {L("Payment", "תשלום")}: {(selected.payment?.method || "cod").toUpperCase()}
                </span>
                {selected.payment?.transactionId && (
                  <span className="font-mono">
                    {L("TX", "מס' עסקה")}: {selected.payment.transactionId}
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="space-y-3">
                {selected.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-4 border rounded-lg p-3">
                    <img
                      src={it.img || "/assets/products/placeholder.jpg"}
                      alt={it.name}
                      className="h-16 w-16 object-cover rounded-md border"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{it.name}</div>
                      <div className="text-sm text-muted-foreground">{it.optionName}</div>
                    </div>
                    <div className="text-sm">x{it.quantity}</div>
                    <div className="w-24 text-right">₪ {(it.price * it.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span>{L("Subtotal", "סכום ביניים")}</span>
                  <span>₪ {selected.totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{L("Shipping", "משלוח")}</span>
                  <span>₪ {selected.totals.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>{L("Total", "סה\"כ")}</span>
                  <span>₪ {selected.totals.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping */}
              {selected.shipping && (
                <div className="grid gap-1 text-sm">
                  <div className="font-medium">{L("Shipping", "משלוח")}</div>
                  {selected.shipping.fullName && <div>{selected.shipping.fullName}</div>}
                  {selected.shipping.phone && <div>{selected.shipping.phone}</div>}
                  <div>
                    {[
                      selected.shipping.addressLine1,
                      selected.shipping.addressLine2,
                      selected.shipping.city,
                      selected.shipping.postalCode,
                      selected.shipping.country,
                    ]
                      .filter(Boolean)
                      .join(language === "he" ? ", " : ", ")}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
