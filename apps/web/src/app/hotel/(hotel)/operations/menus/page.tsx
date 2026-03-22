"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const MENU_TYPE_LABELS: Record<string, string> = {
  ROOM_SERVICE: "Room Service",
  RESTAURANT: "Restaurant",
  BAR: "Bar",
  BREAKFAST: "Breakfast",
  MINIBAR: "Minibar",
  SPA_MENU: "Spa Menu",
  POOL_BAR: "Pool Bar",
};

interface MenuSection {
  title: string;
  items: { name: string; description?: string; price?: number }[];
}

interface MenuForm {
  name: string;
  menuType: string;
  description: string;
  isActive: boolean;
  sections: MenuSection[];
}

const EMPTY_FORM: MenuForm = {
  name: "",
  menuType: "ROOM_SERVICE",
  description: "",
  isActive: true,
  sections: [
    { title: "", items: [{ name: "", description: "", price: undefined }] },
  ],
};

export default function HotelMenusPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuForm>(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.hotelMenu.listForHotel.useQuery(
    { hotelId },
    { enabled: !!hotelId },
  );

  const createMutation = trpc.hotelMenu.create.useMutation({
    onSuccess: () => {
      toast.success("Menu created.");
      void refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.hotelMenu.update.useMutation({
    onSuccess: () => {
      toast.success("Menu updated.");
      void refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.hotelMenu.delete.useMutation({
    onSuccess: () => {
      toast.success("Menu deleted.");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(menu: NonNullable<typeof data>[number]) {
    const sections =
      (menu.content as { sections?: MenuSection[] })?.sections ?? [];
    setForm({
      name: menu.name,
      menuType: menu.menuType,
      description: menu.description ?? "",
      isActive: menu.isActive,
      sections: sections.length > 0 ? sections : EMPTY_FORM.sections,
    });
    setEditingId(menu.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (!form.name || !form.menuType) {
      toast.error("Title and menu type are required.");
      return;
    }
    const payload = {
      hotelId,
      name: form.name,
      menuType: form.menuType as Parameters<
        typeof createMutation.mutate
      >[0]["menuType"],
      description: form.description || undefined,
      isActive: form.isActive,
      content: { sections: form.sections },
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function updateSection(idx: number, field: keyof MenuSection, value: string) {
    const updated = [...form.sections];
    (updated[idx] as unknown as Record<string, unknown>)[field] = value;
    setForm({ ...form, sections: updated });
  }

  function addSection() {
    setForm({
      ...form,
      sections: [...form.sections, { title: "", items: [{ name: "" }] }],
    });
  }

  function removeSection(idx: number) {
    setForm({ ...form, sections: form.sections.filter((_, i) => i !== idx) });
  }

  function updateItem(
    sIdx: number,
    iIdx: number,
    field: string,
    value: string | number | undefined,
  ) {
    const updated = form.sections.map((s, si) => {
      if (si !== sIdx) return s;
      const items = s.items.map((item, ii) => {
        if (ii !== iIdx) return item;
        return { ...item, [field]: value };
      });
      return { ...s, items };
    });
    setForm({ ...form, sections: updated });
  }

  function addItem(sIdx: number) {
    const updated = form.sections.map((s, si) => {
      if (si !== sIdx) return s;
      return { ...s, items: [...s.items, { name: "" }] };
    });
    setForm({ ...form, sections: updated });
  }

  function removeItem(sIdx: number, iIdx: number) {
    const updated = form.sections.map((s, si) => {
      if (si !== sIdx) return s;
      return { ...s, items: s.items.filter((_, ii) => ii !== iIdx) };
    });
    setForm({ ...form, sections: updated });
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="h-6 w-6 text-[#1a1a2e]" />
          <h1 className="text-2xl font-bold text-gray-900">Menus</h1>
        </div>
        {!showForm && (
          <Button
            className="bg-[#1a1a2e] hover:bg-[#16213e]"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm(EMPTY_FORM);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Menu
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="space-y-5 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {editingId ? "Edit Menu" : "Create Menu"}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Title *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Room Service Menu"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Menu Type *
              </label>
              <select
                value={form.menuType}
                onChange={(e) => setForm({ ...form, menuType: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {Object.entries(MENU_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Short description shown to guests"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="menuActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="menuActive" className="text-sm text-gray-700">
              Active (visible to guests)
            </label>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Menu Sections
              </h3>
              <Button size="sm" variant="outline" onClick={addSection}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Section
              </Button>
            </div>

            {form.sections.map((section, sIdx) => (
              <div
                key={sIdx}
                className="space-y-3 rounded-lg border bg-gray-50 p-4"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(sIdx, "title", e.target.value)
                    }
                    placeholder="Section title (e.g. Starters, Mains)"
                    className="flex-1 rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
                  />
                  {form.sections.length > 1 && (
                    <button
                      onClick={() => removeSection(sIdx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(sIdx, iIdx, "name", e.target.value)
                        }
                        placeholder="Item name *"
                        className="flex-1 rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
                      />
                      <input
                        type="text"
                        value={item.description ?? ""}
                        onChange={(e) =>
                          updateItem(sIdx, iIdx, "description", e.target.value)
                        }
                        placeholder="Description"
                        className="flex-1 rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
                      />
                      <input
                        type="number"
                        value={item.price ?? ""}
                        onChange={(e) =>
                          updateItem(
                            sIdx,
                            iIdx,
                            "price",
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                        placeholder="Price"
                        className="w-24 rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
                      />
                      {section.items.length > 1 && (
                        <button
                          onClick={() => removeItem(sIdx, iIdx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addItem(sIdx)}
                  className="text-xs text-[#1a1a2e] hover:underline"
                >
                  + Add item
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              className="bg-[#1a1a2e] hover:bg-[#16213e]"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending
                ? "Saving..."
                : editingId
                  ? "Update Menu"
                  : "Create Menu"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border bg-white py-12 text-center">
          <UtensilsCrossed className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No menus yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((menu) => {
            const isExpanded = expandedId === menu.id;
            const sections =
              (menu.content as { sections?: MenuSection[] })?.sections ?? [];
            return (
              <div
                key={menu.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div
                    className="flex-1 cursor-pointer space-y-1"
                    onClick={() => setExpandedId(isExpanded ? null : menu.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#1a1a2e]/10 px-2 py-0.5 text-xs font-medium text-[#1a1a2e]">
                        {MENU_TYPE_LABELS[menu.menuType] ?? menu.menuType}
                      </span>
                      {!menu.isActive && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900">{menu.name}</p>
                    {menu.description && (
                      <p className="text-sm text-gray-500">
                        {menu.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {sections.length} section
                      {sections.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEdit(menu)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this menu?"))
                          deleteMutation.mutate({ id: menu.id });
                      }}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : menu.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && sections.length > 0 && (
                  <div className="space-y-4 border-t bg-gray-50 p-4">
                    {sections.map((section, idx) => (
                      <div key={idx}>
                        {section.title && (
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {section.title}
                          </p>
                        )}
                        <div className="space-y-1.5">
                          {section.items.map((item, iIdx) => (
                            <div
                              key={iIdx}
                              className="flex items-start justify-between gap-2"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-gray-500">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {item.price !== undefined &&
                                item.price !== null && (
                                  <p className="flex-shrink-0 text-sm font-semibold text-gray-900">
                                    ${item.price.toFixed(2)}
                                  </p>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
