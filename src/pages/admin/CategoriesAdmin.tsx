import { useEffect, useState } from "react";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/adminApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Cat = { _id: string; name: string };

export default function CategoriesAdmin() {
  const { language } = useLanguage();
  const L = (en: string, he: string) => (language === "he" ? he : en);
  const rtl = language === "he";

  const [rows, setRows] = useState<Cat[]>([]);
  const [filtered, setFiltered] = useState<Cat[]>([]);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [editStates, setEditStates] = useState<Record<string, { name: string }>>({});

  async function refresh() {
    const data = await listCategories();
    setRows(data);
    setFiltered(data);
  }
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(q ? rows.filter(c => c.name.toLowerCase().includes(q)) : rows);
  }, [search, rows]);

  async function onAdd() {
    const n = name.trim();
    if (!n) return;
    await createCategory({ name: n });
    setName("");
    refresh();
  }

  async function onUpdate(id: string) {
    const changes = editStates[id];
    const n = changes?.name.trim();
    if (!n) return;
    await updateCategory(id, { name: n });
    setEditStates(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    refresh();
  }

  async function onDelete(id: string) {
    if (!confirm(L("Delete category?", "למחוק קטגוריה?"))) return;
    const res = await deleteCategory(id);
    if (res?.error) alert(res.error);
    await refresh();
  }

  return (
    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-semibold">{L("Categories", "קטגוריות")}</h1>

      {/* Add new */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder={L("New category name", "שם קטגוריה חדש")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-64"
          aria-label={L("New category name", "שם קטגוריה חדש")}
        />
        <Button onClick={onAdd}>{L("Add", "הוסף")}</Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder={L("Search categories...", "חפש קטגוריות...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={L("Search categories", "חיפוש קטגוריות")}
        />
      </div>

      {/* List */}
      <div className="border rounded divide-y">
        {filtered.map((c) => {
          const edit = editStates[c._id];
          const isEditing = !!edit;
          const nameVal = isEditing ? edit.name : c.name;

          return (
            <div
              key={c._id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-2"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col gap-2 w-full">
                  <Input
                    value={nameVal}
                    onChange={(e) =>
                      setEditStates((prev) => ({
                        ...prev,
                        [c._id]: { name: e.target.value },
                      }))
                    }
                    aria-label={L("Category name", "שם קטגוריה")}
                  />
                </div>
              </div>

              <div className="flex gap-2 self-end md:self-center">
                {isEditing && nameVal !== c.name && (
                  <Button onClick={() => onUpdate(c._id)}>
                    {L("Update", "עדכן")}
                  </Button>
                )}
                <Button variant="destructive" onClick={() => onDelete(c._id)}>
                  {L("Delete", "מחק")}
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-3 text-muted-foreground">
            {L("No categories", "אין קטגוריות")}
          </div>
        )}
      </div>
    </div>
  );
}
