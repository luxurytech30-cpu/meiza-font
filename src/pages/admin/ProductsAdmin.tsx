// src/pages/ProductsAdmin.tsx
import {
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ChangeEvent,
} from "react";
import {
  listProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  getProduct,
  listCategories,
  deleteOptionImageApi,
  destroyByPublicIdApi,
} from "@/lib/adminApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

type Cat = { _id: string; name: string };

type Option = {
  _id?: string;
  name: string;
  price: number;
  vipPrice?: number; // optional
  quantity: number;
  img?: string;
  imgId?: string;
  isDefault?: boolean;
  sale?: { start?: string; end?: string; price?: number };
};

type Product = {
  _id?: string;
  name: string;
  desc?: string;
  category?: string | { _id: string; name: string };
  options: Option[];
};

// ---- Reusable components (top-level) ----

type LabeledInputProps = { label: string } & ComponentProps<typeof Input>;

function LabeledInput({ label, ...props }: LabeledInputProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input {...props} />
    </label>
  );
}

type OptionImageUploaderProps = {
  value?: string;
  onChange: (url: string) => void;
  onChangeId: (id: string) => void;
  folder?: string;
};

function OptionImageUploader({
  value,
  onChange,
  onChangeId,
  folder = "meiza/options",
}: OptionImageUploaderProps) {
  const { language } = useLanguage();
  const L = (en: string, he: string) => (language === "he" ? he : en);

  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState(0);

  async function handle(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const { url, id } = await uploadToCloudinary(f, folder);
      onChange(url);
      onChangeId(id);
    } finally {
      setBusy(false);
      setKey((k) => k + 1); // reset file input
    }
  }

  return (
    <div className="space-y-2">
      <input
        key={key}
        type="file"
        accept="image/*"
        onChange={handle}
        aria-label={L("Upload option image", "העלה תמונת אפשרות")}
      />
      {busy && (
        <p className="text-xs text-muted-foreground">
          {L("Uploading…", "מעלה…")}
        </p>
      )}
      {value && (
        <img
          src={value}
          alt={L("Option image", "תמונת אפשרות")}
          className="h-20 w-20 rounded object-cover"
        />
      )}
    </div>
  );
}

// ---- Main page component ----

function ProductsAdmin() {
  const { language } = useLanguage();
  const L = (en: string, he: string) => (language === "he" ? he : en);

  const [rows, setRows] = useState<Product[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Product>({
    name: "",
    desc: "",
    category: "",
    options: [],
  });

  const load = async () => setRows(await listProducts());
  const loadCats = async () => setCats(await listCategories());

  useEffect(() => {
    load();
    loadCats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (p) =>
        String(p.name).toLowerCase().includes(q) ||
        (typeof p.category === "object"
          ? p.category?.name?.toLowerCase().includes(q)
          : false)
    );
  }, [rows, search]);

  const hasOptions = form.options.length > 0;
  const hasDefault = form.options.some((o) => o.isDefault);
  const optionFieldsOk = form.options.every(
    (o) => (o.name?.trim()?.length || 0) > 0 && Number.isFinite(Number(o.price))
  );
  const optionOk = hasOptions && hasDefault && optionFieldsOk;

  function openCreate() {
    setForm({ name: "", desc: "", category: "", options: [] });
    setOpen(true);
  }

  async function openEdit(id: string) {
    const p = await getProduct(id);
    const catId = typeof p.category === "object" ? p.category?._id : p.category;
    setForm({ ...p, category: catId });
    setOpen(true);
  }

  function setField<K extends keyof Product>(k: K, v: Product[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function upsertOption(idx: number, patch: Partial<Option>) {
    setForm((prev) => {
      const copy = [...prev.options];
      copy[idx] = { ...copy[idx], ...patch };
      return { ...prev, options: copy };
    });
  }

  function addOption() {
    setForm((prev) => {
      const makeDefault = !prev.options.some((o) => o.isDefault);
      return {
        ...prev,
        options: [
          ...prev.options,
          {
            name: "",
            price: 0,
            vipPrice: undefined,
            quantity: 0,
            img: "",
            imgId: "",
            isDefault: makeDefault,
            sale: { start: "", end: "", price: undefined },
          },
        ],
      };
    });
  }

  function removeOption(idx: number) {
    const removed = form.options[idx];
    if (!removed?._id && removed?.imgId) {
      void destroyByPublicIdApi(removed.imgId).catch(() => {});
    }
    setForm((prev) => {
      const removedIsDefault = !!prev.options[idx]?.isDefault;
      const rest = prev.options.filter((_, i) => i !== idx);
      const next = removedIsDefault
        ? rest.map((o) => ({ ...o, isDefault: false }))
        : rest;
      return { ...prev, options: next };
    });
  }

  function setDefault(idx: number) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => ({ ...o, isDefault: i === idx })),
    }));
  }

  async function onSave() {
    if (!form.name?.trim()) return alert(L("Name required", "יש למלא שם"));
    if (!form.category) return alert(L("Category required", "יש לבחור קטגוריה"));
    if (!hasOptions)
      return alert(L("Add at least one option", "הוסף לפחות אפשרות אחת"));
    if (!hasDefault)
      return alert(L("Choose a default option", "בחר אפשרות ברירת מחדל"));
    if (!optionFieldsOk)
      return alert(
        L(
          "Each option needs a name and a numeric price",
          "לכל אפשרות נדרש שם ומחיר מספרי"
        )
      );

    // validate vipPrice if present
    for (const o of form.options) {
      const hasVip =
        o.vipPrice !== undefined &&
        o.vipPrice !== null &&
        String(o.vipPrice) !== "";
      if (hasVip && !Number.isFinite(Number(o.vipPrice))) {
        return alert(
          L(
            "VIP price must be numeric when provided.",
            "מחיר VIP חייב להיות מספרי אם צוין."
          )
        );
      }
    }

    setSaving(true);
    try {
      const payload: Product = {
        name: form.name.trim(),
        desc: form.desc || "",
        category: form.category as string,
        options: form.options.map((o) => ({
          _id: o._id,
          name: o.name?.trim() || "",
          price: Number(o.price ?? 0),
          vipPrice:
            o.vipPrice === undefined ||
            o.vipPrice === null ||
            String(o.vipPrice) === ""
              ? undefined
              : Number(o.vipPrice),
          quantity: Number(o.quantity ?? 0),
          img: o.img || "",
          imgId: o.imgId || "",
          isDefault: !!o.isDefault,
          sale: {
            start: o.sale?.start || "",
            end: o.sale?.end || "",
            price:
              o.sale?.price != null && String(o.sale?.price) !== ""
                ? Number(o.sale?.price)
                : undefined,
          },
        })),
      };

      if (form._id) await updateProduct(form._id, payload);
      else await createProduct(payload);

      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm(L("Delete product?", "למחוק מוצר?"))) return;
    await deleteProduct(id);
    await load();
  }

  const rtl = language === "he";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{L("Products", "מוצרים")}</h1>
        <div className="flex gap-2">
          <Input
            placeholder={L(
              "Search by name or category…",
              "חפש לפי שם או קטגוריה…"
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={L("Search products", "חיפוש מוצרים")}
          />
          <Button onClick={openCreate}>{L("New Product", "מוצר חדש")}</Button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded" dir={rtl ? "rtl" : "ltr"}>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                {L("Image", "תמונה")}
              </th>
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                {L("Name", "שם")}
              </th>
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                {L("Category", "קטגוריה")}
              </th>
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                {L("Options", "אפשרויות")}
              </th>
              <th className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                {L("Actions", "פעולות")}
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => {
              const thumb = p.options?.[0]?.img;
              return (
                <tr
                  key={p._id}
                  className="border-t hover:bg-muted/50 cursor-pointer"
                  onClick={() => openEdit(p._id!)}
                >
                  <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={String(p.name)}
                        className="h-12 w-12 object-cover rounded inline-block"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded inline-block" />
                    )}
                  </td>

                  <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                    {String(p.name)}
                  </td>

                  <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                    {typeof p.category === "object" ? p.category?.name : ""}
                  </td>

                  <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                    {p.options?.length || 0}
                  </td>

                  <td className={`p-2 ${rtl ? "text-right" : "text-left"}`}>
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        onClick={() => openEdit(p._id!)}
                      >
                        {L("Edit", "ערוך")}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => onDelete(p._id!)}
                      >
                        {L("Delete", "מחק")}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  className={`p-4 text-muted-foreground ${
                    rtl ? "text-right" : "text-left"
                  }`}
                  colSpan={5}
                >
                  {L("No products", "אין מוצרים")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form._id
                ? L("Edit Product", "עריכת מוצר")
                : L("New Product", "מוצר חדש")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <LabeledInput
                label={L("Name", "שם")}
                value={String(form.name)}
                onChange={(e) => setField("name", e.target.value)}
              />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  {L("Category", "קטגוריה")}
                </span>
                <Select
                  value={(form.category as string) || ""}
                  onValueChange={(v) => setField("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={L("Select category", "בחר קטגוריה")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cats.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  {L("Description", "תיאור")}
                </span>
                <Textarea
                  value={form.desc || ""}
                  onChange={(e) => setField("desc", e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {L("Options", "אפשרויות")}{" "}
                <span className="text-red-600 text-xs align-middle">
                  {L("required", "חובה")}
                </span>
              </h3>
              <Button variant="outline" onClick={addOption}>
                {L("Add Option", "הוסף אפשרות")}
              </Button>
            </div>

            <div className="space-y-3">
              {form.options.map((o, idx) => (
                <div key={idx} className="border rounded p-3 space-y-3">
                  <div className="grid gap-2 md:grid-cols-7">
                    <LabeledInput
                      label={L("Option name", "שם אפשרות")}
                      value={o.name}
                      onChange={(e) =>
                        upsertOption(idx, { name: e.target.value })
                      }
                    />
                    <LabeledInput
                      label={L("Price", "מחיר")}
                      type="number"
                      value={o.price}
                      onChange={(e) =>
                        upsertOption(idx, { price: Number(e.target.value) })
                      }
                    />
                    <LabeledInput
                      label={L(
                        "VIP price (optional)",
                        "מחיר VIP (אופציונלי)"
                      )}
                      type="number"
                      value={o.vipPrice ?? ""}
                      onChange={(e) =>
                        upsertOption(idx, {
                          vipPrice:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                    />
                    <LabeledInput
                      label={L("Quantity", "כמות")}
                      type="number"
                      value={o.quantity}
                      onChange={(e) =>
                        upsertOption(idx, { quantity: Number(e.target.value) })
                      }
                    />
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {L("Option Image", "תמונת אפשרות")}
                      </span>
                      <OptionImageUploader
                        value={o.img}
                        onChange={(url) => upsertOption(idx, { img: url })}
                        onChangeId={(id) => upsertOption(idx, { imgId: id })}
                        folder="meiza/options"
                      />
                      {o.img ? (
                        <div className="mt-2 flex gap-2">
                          <Button
                            variant="outline"
                            type="button"
                            onClick={async () => {
                              try {
                                if (form._id && o._id) {
                                  await deleteOptionImageApi(
                                    form._id as string,
                                    o._id as string
                                  );
                                } else if (o.imgId) {
                                  await destroyByPublicIdApi(o.imgId);
                                }
                              } finally {
                                upsertOption(idx, { img: "", imgId: "" });
                              }
                            }}
                          >
                            {L("Remove image", "הסר תמונה")}
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    <LabeledInput
                      label={L("Sale price", "מחיר במבצע")}
                      type="number"
                      value={o.sale?.price ?? ""}
                      onChange={(e) =>
                        upsertOption(idx, {
                          sale: {
                            ...(o.sale || {}),
                            price:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          },
                        })
                      }
                    />
                    <div className="flex items-end gap-3 flex-wrap">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="defaultOption"
                          checked={!!o.isDefault}
                          onChange={() => setDefault(idx)}
                        />
                        {L("Default", "ברירת מחדל")}
                      </label>
                      <Button
                        variant="destructive"
                        onClick={() => removeOption(idx)}
                        type="button"
                      >
                        {L("Remove", "הסר")}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <LabeledInput
                      label={L(
                        "Sale start (YYYY-MM-DD)",
                        "תחילת מבצע (YYYY-MM-DD)"
                      )}
                      value={o.sale?.start || ""}
                      onChange={(e) =>
                        upsertOption(idx, {
                          sale: { ...(o.sale || {}), start: e.target.value },
                        })
                      }
                    />
                    <LabeledInput
                      label={L(
                        "Sale end (YYYY-MM-DD)",
                        "סיום מבצע (YYYY-MM-DD)"
                      )}
                      value={o.sale?.end || ""}
                      onChange={(e) =>
                        upsertOption(idx, {
                          sale: { ...(o.sale || {}), end: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {!hasOptions && (
              <p className="text-sm text-red-600">
                {L("Add at least one option.", "הוסף לפחות אפשרות אחת.")}
              </p>
            )}
            {hasOptions && !hasDefault && (
              <p className="text-sm text-red-600">
                {L("Choose a default option.", "בחר אפשרות ברירת מחדל.")}
              </p>
            )}
            {hasOptions && !optionFieldsOk && (
              <p className="text-sm text-red-600">
                {L(
                  "Each option needs a name and price.",
                  "לכל אפשרות נדרש שם ומחיר."
                )}
              </p>
            )}
          </div>

          <DialogFooter className="justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                {L("Cancel", "בטל")}
              </Button>
              <Button
                onClick={onSave}
                disabled={saving || !form.name || !form.category || !optionOk}
              >
                {saving ? L("Saving...", "שומר...") : L("Save", "שמור")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductsAdmin;
