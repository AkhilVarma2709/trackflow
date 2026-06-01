import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/trackflow/DashboardShell";
import { PrimaryButton } from "@/components/trackflow/Buttons";
import { requireAuth } from "@/lib/supabase";

export const Route = createFileRoute("/settings")({
  beforeLoad: requireAuth,
  component: SettingsPage,
});

function Field({ label, type = "text", value = "" }: { label: string; type?: string; value?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-charcoal mb-1.5">{label}</label>
      <input defaultValue={value} type={type} className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <h2 className="text-lg font-medium text-charcoal">{title}</h2>
      <div className="mt-5 max-w-md space-y-4">{children}</div>
    </div>
  );
}

function SettingsPage() {
  return (
    <DashboardShell title="Settings" subtitle="Manage your account.">
      <div className="space-y-5">
        <Card title="Account">
          <Field label="Full name" value="Jane Doe" />
          <Field label="Email" type="email" value="jane@trackflow.io" />
          <PrimaryButton>Save changes</PrimaryButton>
        </Card>
        <Card title="Security">
          <Field label="Current password" type="password" />
          <Field label="New password" type="password" />
          <Field label="Confirm new password" type="password" />
          <PrimaryButton>Update password</PrimaryButton>
        </Card>
      </div>
    </DashboardShell>
  );
}
