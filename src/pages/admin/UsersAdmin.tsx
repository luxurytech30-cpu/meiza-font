// pages/admin/UsersAdmin.tsx
import { useEffect, useMemo, useState } from "react";
import { listUsers, updateUser, deleteUser, createUser } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

type U = {
  _id: string;
  name: string;
  username: string;
  roles: string[];
  isActive: boolean;
};

const ALL_ROLES = ["customer", "vip", "admin"] as const;
type Role = typeof ALL_ROLES[number];

function pickRole(roles?: string[]): Role {
  const set = new Set((roles || []) as Role[]);
  if (set.has("admin")) return "admin";
  if (set.has("vip")) return "vip";
  return "customer";
}

export default function UsersAdmin() {
  const { user: me } = useAuth();
  const { language } = useLanguage();
  const L = (en: string, he: string) => (language === "he" ? he : en);
  const rtl = language === "he";

  const roleLabel = (r: Role) =>
    r === "admin" ? L("admin", "אדמין")
    : r === "vip" ? L("vip", "‏VIP")
    : L("customer", "לקוח");

  const [rows, setRows] = useState<U[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Partial<U> & {
    password?: string;
    role?: Role;
  }>({
    name: "",
    username: "",
    role: "customer",
    isActive: true,
    password: "",
  });

  const load = async () => setRows(await listUsers());
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.roles || []).join(",").toLowerCase().includes(q)
    );
  }, [rows, search]);

  function openCreate() {
    setForm({
      name: "",
      username: "",
      role: "customer",
      isActive: true,
      password: "",
    });
    setOpen(true);
  }

  function openEdit(u: U) {
    setForm({ ...u, password: "", role: pickRole(u.roles) });
    setOpen(true);
  }

  const isMe = (id?: string) => me && id && me._id === id;

  async function onSave() {
    setSaving(true);
    try {
      const role: Role = form.role || "customer";
      const payload: any = {
        name: (form.name || "").trim(),
        roles: [role],
        isActive: form.isActive ?? true,
      };
      if (form.password) payload.password = form.password;

      if (form._id) {
        if (isMe(form._id) && role !== "admin") {
          alert(L("You cannot remove your own admin role.", "אי אפשר להסיר לעצמך את תפקיד האדמין"));
          setSaving(false);
          return;
        }
        await updateUser(form._id, payload);
      } else {
        await createUser({
          ...payload,
          username: (form.username || "").trim(),
        });
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      alert(e?.message || L("Save failed.", "השמירה נכשלה."));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (isMe(id)) {
      alert(L("You cannot delete your own user.", "אי אפשר למחוק את המשתמש שלך."));
      return;
    }
    if (!confirm(L("Delete user?", "למחוק משתמש?"))) return;
    await deleteUser(id);
    await load();
  }

  return (
    <div className="space-y-4" dir={rtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{L("Users", "משתמשים")}</h1>
        <div className="flex gap-2">
          <Input
            placeholder={L("Search by name, username, or role…", "חפש לפי שם, שם משתמש או תפקיד…")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={L("Search users", "חיפוש משתמשים")}
          />
          <Button onClick={openCreate}>{L("New User", "משתמש חדש")}</Button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{L("Name", "שם")}</th>
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{L("Username", "שם משתמש")}</th>
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{L("Role", "תפקיד")}</th>
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{L("Active", "פעיל")}</th>
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{L("Actions", "פעולות")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u._id}
                className="border-t hover:bg-muted/50 cursor-pointer"
                onClick={() => openEdit(u)}
              >
                <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{u.name}</td>
                <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{u.username}</td>
                <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>{roleLabel(pickRole(u.roles))}</td>
                <td
  className={`p-2 ${rtl ? "text-right" : "text-left"}`}
  onClick={(e) => e.stopPropagation()}
  onPointerDownCapture={(e) => e.stopPropagation()}
>
  <div dir="ltr" className="inline-block">
    <Switch
      checked={u.isActive}
      onCheckedChange={async (v) => {
        if (isMe(u._id) && !v) {
          alert(L("You cannot deactivate your own user.", "אי אפשר להשבית את המשתמש שלך."));
          return;
        }
        try {
          await updateUser(u._id, { isActive: v });
          setRows((rows) =>
            rows.map((x) => (x._id === u._id ? { ...x, isActive: v } : x))
          );
        } catch (e: any) {
          alert(e?.message || L("Failed to update status.", "עדכון הסטטוס נכשל."));
        }
      }}
    />
  </div>
</td>


                <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" onClick={() => openEdit(u)}>
                      {L("Edit", "ערוך")}
                    </Button>
                    <Button variant="destructive" onClick={() => onDelete(u._id)}>
                      {L("Delete", "מחק")}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className={`p-4 text-muted-foreground ${rtl ? "text-right" : "text-left"}`} colSpan={5}>
                  {L("No users found", "לא נמצאו משתמשים")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {form._id ? L("Edit User", "עריכת משתמש") : L("New User", "משתמש חדש")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{L("Name", "שם")}</span>
              <Input
                value={form.name || ""}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{L("Username", "שם משתמש")}</span>
              <Input
                value={form.username || ""}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                disabled={!!form._id}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                {form._id
                  ? L("Password (leave blank to keep)", "סיסמה (השאר ריק כדי לשמור)")
                  : L("Password", "סיסמה")}
              </span>
              <Input
                type="password"
                value={form.password || ""}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </label>

            {/* Single role select */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{L("Role", "תפקיד")}</span>
              <Select
                value={form.role || "customer"}
                onValueChange={(v: Role) => setForm((p) => ({ ...p, role: v }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={L("Select role", "בחר תפקיד")} />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabel(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{L("Active", "פעיל")}</span>
              <Switch
                checked={!!form.isActive}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
              />
            </div>
          </div>

          <DialogFooter className="justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              {L("Cancel", "בטל")}
            </Button>
            <Button
              onClick={onSave}
              disabled={saving || !form.name || !form.username || !form.role}
            >
              {saving ? L("Saving...", "שומר...") : L("Save", "שמור")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
