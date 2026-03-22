"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Briefcase, Plus, X, ChevronLeft } from "lucide-react";

const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "SEASONAL",
  "INTERNSHIP",
  "TRAINEE",
  "TEMPORARY",
] as const;
const EXPERIENCE_LEVELS = [
  "ENTRY",
  "JUNIOR",
  "MID",
  "SENIOR",
  "MANAGEMENT",
] as const;
const DEPARTMENTS = [
  "FRONT_DESK",
  "CONCIERGE",
  "HOUSEKEEPING",
  "DINING",
  "ROOM_SERVICE",
  "MANAGEMENT",
  "MAINTENANCE",
  "SPA",
  "SECURITY",
  "OTHER",
] as const;

const DEPT_LABELS: Record<string, string> = {
  FRONT_DESK: "Front Desk",
  CONCIERGE: "Concierge",
  HOUSEKEEPING: "Housekeeping",
  DINING: "Dining",
  ROOM_SERVICE: "Room Service",
  MANAGEMENT: "Management",
  MAINTENANCE: "Maintenance",
  SPA: "Spa",
  SECURITY: "Security",
  OTHER: "Other",
};

const EMP_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  SEASONAL: "Seasonal",
  INTERNSHIP: "Internship",
  TRAINEE: "Trainee",
  TEMPORARY: "Temporary",
};

const EXP_LABELS: Record<string, string> = {
  ENTRY: "Entry Level",
  JUNIOR: "Junior",
  MID: "Mid Level",
  SENIOR: "Senior",
  MANAGEMENT: "Management",
};

interface JobForm {
  title: string;
  department: string;
  employmentType: string;
  experienceLevel: string;
  city: string;
  country: string;
  description: string;
  accommodationIncluded: boolean;
  mealsIncluded: boolean;
  visaSupport: boolean;
  isFeatured: boolean;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  deadline: string;
  tags: string[];
  requirements: { label: string; isRequired: boolean }[];
  benefits: string[];
}

const EMPTY_FORM: JobForm = {
  title: "",
  department: "FRONT_DESK",
  employmentType: "FULL_TIME",
  experienceLevel: "ENTRY",
  city: "",
  country: "",
  description: "",
  accommodationIncluded: false,
  mealsIncluded: false,
  visaSupport: false,
  isFeatured: false,
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "USD",
  deadline: "",
  tags: [],
  requirements: [{ label: "", isRequired: true }],
  benefits: [""],
};

export default function CreateJobPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [form, setForm] = useState<JobForm>(EMPTY_FORM);
  const [newTag, setNewTag] = useState("");

  const createMutation = trpc.jobPosting.create.useMutation({
    onSuccess: (data) => {
      toast.success("Job posting created.");
      router.push("/hotel/hr/jobs");
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(_publish: boolean) {
    if (!form.title || !form.city || !form.country || !form.description) {
      toast.error("Title, location, and description are required.");
      return;
    }
    const requirements = form.requirements.filter((r) => r.label.trim());
    const benefits = form.benefits.filter((b) => b.trim());

    createMutation.mutate({
      hotelId,
      title: form.title,
      department: form.department as (typeof DEPARTMENTS)[number],
      employmentType: form.employmentType as (typeof EMPLOYMENT_TYPES)[number],
      experienceLevel:
        (form.experienceLevel as (typeof EXPERIENCE_LEVELS)[number]) ||
        undefined,
      city: form.city,
      country: form.country,
      description: form.description,
      accommodationIncluded: form.accommodationIncluded,
      mealsIncluded: form.mealsIncluded,
      visaSupport: form.visaSupport,
      salaryMinCents: form.salaryMin
        ? Math.round(parseFloat(form.salaryMin) * 100)
        : undefined,
      salaryMaxCents: form.salaryMax
        ? Math.round(parseFloat(form.salaryMax) * 100)
        : undefined,
      currency: form.salaryCurrency || "USD",
      deadline: form.deadline
        ? new Date(form.deadline).toISOString()
        : undefined,
      tags: form.tags.length > 0 ? form.tags : [],
      requirements: requirements.length > 0 ? requirements : [],
      benefits: benefits.length > 0 ? benefits : [],
    });
  }

  function addTag() {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm({ ...form, tags: [...form.tags, newTag.trim()] });
      setNewTag("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Briefcase className="h-6 w-6 text-[#1a1a2e]" />
        <h1 className="text-2xl font-bold text-gray-900">Create Job Posting</h1>
      </div>

      <div className="space-y-5">
        {/* Basic Info */}
        <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Job Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Front Desk Agent, Head Chef"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Department *
              </label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {DEPT_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Employment Type *
              </label>
              <select
                value={form.employmentType}
                onChange={(e) =>
                  setForm({ ...form, employmentType: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EMP_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Experience Level
              </label>
              <select
                value={form.experienceLevel}
                onChange={(e) =>
                  setForm({ ...form, experienceLevel: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {EXP_LABELS[l]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                City *
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Country *
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Application Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              placeholder="Describe the role, responsibilities, and what makes this opportunity special..."
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
            />
          </div>
        </div>

        {/* Perks */}
        <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Perks & Compensation</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                { key: "accommodationIncluded", label: "Accommodation" },
                { key: "mealsIncluded", label: "Meals Included" },
                { key: "visaSupport", label: "Visa Support" },
                { key: "isFeatured", label: "Featured Listing" },
              ] as const
            ).map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.checked })
                  }
                  className="rounded"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Min Salary / Year
              </label>
              <input
                type="number"
                value={form.salaryMin}
                onChange={(e) =>
                  setForm({ ...form, salaryMin: e.target.value })
                }
                placeholder="e.g. 30000"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Max Salary / Year
              </label>
              <input
                type="number"
                value={form.salaryMax}
                onChange={(e) =>
                  setForm({ ...form, salaryMax: e.target.value })
                }
                placeholder="e.g. 45000"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Currency
              </label>
              <input
                type="text"
                value={form.salaryCurrency}
                onChange={(e) =>
                  setForm({ ...form, salaryCurrency: e.target.value })
                }
                placeholder="USD"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Requirements</h2>
          <div className="space-y-2">
            {form.requirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={req.label}
                  onChange={(e) => {
                    const updated = [...form.requirements];
                    updated[idx] = { ...updated[idx]!, label: e.target.value };
                    setForm({ ...form, requirements: updated });
                  }}
                  placeholder="e.g. 2+ years hotel experience"
                  className="flex-1 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
                />
                <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={req.isRequired}
                    onChange={(e) => {
                      const updated = [...form.requirements];
                      updated[idx] = {
                        ...updated[idx]!,
                        isRequired: e.target.checked,
                      };
                      setForm({ ...form, requirements: updated });
                    }}
                    className="rounded"
                  />
                  Required
                </label>
                {form.requirements.length > 1 && (
                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        requirements: form.requirements.filter(
                          (_, i) => i !== idx,
                        ),
                      })
                    }
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              setForm({
                ...form,
                requirements: [
                  ...form.requirements,
                  { label: "", isRequired: false },
                ],
              })
            }
            className="text-xs text-[#1a1a2e] hover:underline"
          >
            + Add requirement
          </button>
        </div>

        {/* Benefits */}
        <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Benefits</h2>
          <div className="space-y-2">
            {form.benefits.map((b, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={b}
                  onChange={(e) => {
                    const updated = [...form.benefits];
                    updated[idx] = e.target.value;
                    setForm({ ...form, benefits: updated });
                  }}
                  placeholder="e.g. Health insurance, Staff discount"
                  className="flex-1 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
                />
                {form.benefits.length > 1 && (
                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        benefits: form.benefits.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              setForm({ ...form, benefits: [...form.benefits, ""] })
            }
            className="text-xs text-[#1a1a2e] hover:underline"
          >
            + Add benefit
          </button>
        </div>

        {/* Tags */}
        <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Tags</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag and press Enter"
              className="flex-1 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
            />
            <Button size="sm" variant="outline" onClick={addTag}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                >
                  {tag}
                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        tags: form.tags.filter((t) => t !== tag),
                      })
                    }
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            className="bg-[#1a1a2e] hover:bg-[#16213e]"
            onClick={() => handleSubmit(true)}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Publish Now"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={createMutation.isPending}
          >
            Save as Draft
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
