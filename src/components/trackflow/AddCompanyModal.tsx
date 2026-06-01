import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PrimaryButton } from "./Buttons";
import { addCompany } from "@/lib/companies";
import { runResearchPipeline } from "@/lib/research/pipeline";

export function AddCompanyModal({
  open,
  onClose,
  onCreated,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  userId?: string;
}) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setError("You must be logged in to add a company.");
      return;
    }

    setError("");
    setSaving(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const company = await addCompany(userId, {
        name: String(formData.get("name") ?? ""),
        website_url: String(formData.get("website_url") ?? ""),
        linkedin_url: String(formData.get("linkedin_url") ?? "") || null,
        industry: String(formData.get("industry") ?? "") || null,
      });
      runResearchPipeline(company.id, company.name, company.website_url, company.linkedin_url || "").catch(console.error);
      form.reset();
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save company.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-charcoal/30"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-charcoal">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-medium text-charcoal">Add New Company</h2>
            <p className="text-sm text-muted-foreground mt-1">Start tracking competitive intelligence.</p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Field name="name" label="Company Name" placeholder="NovaTech" />
              <Field name="website_url" label="Website URL" placeholder="https://novatech.io" />
              <Field name="linkedin_url" label="LinkedIn URL (optional)" placeholder="https://linkedin.com/company/..." />
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5">Industry</label>
                <select name="industry" className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-gold">
                  <option>SaaS</option>
                  <option>Fintech</option>
                  <option>AI</option>
                  <option>MarTech</option>
                  <option>Enterprise Software</option>
                </select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-muted-foreground hover:text-charcoal">Cancel</button>
                <PrimaryButton type="submit" className="w-full sm:w-auto" disabled={saving}>
                  Start Tracking
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-charcoal mb-1.5">{label}</label>
      <input
        name={name}
        required={name !== "linkedin_url"}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
      />
    </div>
  );
}
