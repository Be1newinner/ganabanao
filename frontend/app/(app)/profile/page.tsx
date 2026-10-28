"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FormField, Notice, PageHeader, Panel, Spinner } from "@/components/common";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useFormSubmit } from "@/components/use-form";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useSession } from "@/lib/session";
import type { User } from "@/lib/types";

/** Profile (FR-2.3): name and password; account deletion (NFR-20). */
export default function ProfilePage() {
  const { user, setUser } = useSession();
  const router = useRouter();
  const nameForm = useFormSubmit();
  const passwordForm = useFormSubmit();
  const [name, setName] = useState(user?.name ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  return (
    <>
      <PageHeader title="Profile" />

      <div className="mb-8 flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="bg-brand-gradient font-display text-xl font-bold text-white">
            {user.name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-display text-xl font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">
            {user.email} · member since {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid max-w-2xl gap-6">
        <Panel title="Your name">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-start"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await nameForm.run(() => api.patch<User>("/auth/me", { name }));
              if (res) {
                setUser(res.data);
                toast.success("Name updated");
              }
            }}
          >
            <div className="flex-1">
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} aria-label="Name" />
              {(nameForm.fieldErrors.name || nameForm.error) && (
                <p className="mt-1 text-sm text-destructive">{nameForm.fieldErrors.name ?? nameForm.error}</p>
              )}
            </div>
            <Button type="submit" disabled={nameForm.busy || name.trim() === user.name}>
              {nameForm.busy && <Spinner />} Save
            </Button>
          </form>
        </Panel>

        <Panel
          title={user.hasPassword ? "Change password" : "Set a password"}
          description={
            user.hasPassword
              ? "You will stay signed in here and be signed out on other devices."
              : "You signed up with Google. Add a password to also log in with your email."
          }
        >
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const f = new FormData(form);
              if (f.get("newPassword") !== f.get("confirm")) {
                passwordForm.setError("The two new passwords do not match.");
                return;
              }
              const res = await passwordForm.run(() =>
                api.post<User>("/auth/change-password", {
                  currentPassword: f.get("currentPassword") || undefined,
                  newPassword: f.get("newPassword"),
                })
              );
              if (res) {
                setUser(res.data);
                form.reset();
                toast.success("Password saved");
              }
            }}
          >
            {passwordForm.error && <Notice tone="error">{passwordForm.error}</Notice>}
            {user.hasPassword && (
              <FormField label="Current password" htmlFor="currentPassword" error={passwordForm.fieldErrors.currentPassword}>
                <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" />
              </FormField>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="New password" htmlFor="newPassword" error={passwordForm.fieldErrors.newPassword} hint="At least 8 characters">
                <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} />
              </FormField>
              <FormField label="Confirm new password" htmlFor="confirm">
                <Input id="confirm" name="confirm" type="password" autoComplete="new-password" />
              </FormField>
            </div>
            <Button type="submit" disabled={passwordForm.busy}>
              {passwordForm.busy && <Spinner />} Save password
            </Button>
          </form>
        </Panel>

        <Panel
          title="Delete account"
          description="Deletes your account, all your songs and stems, and your credits. Payment records are kept for accounting. This cannot be undone."
          className="border-destructive/30"
        >
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete my account
          </Button>
        </Panel>
      </div>

      <Dialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          setConfirmText("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              All {user.credits} credits and every song you made will be lost. Type <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} aria-label="Type DELETE to confirm" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Keep my account
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== "DELETE" || deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await api.delete("/auth/me");
                  setUser(null);
                  router.replace("/");
                  toast.success("Your account has been deleted.");
                } catch (err) {
                  toast.error(err instanceof ApiError ? err.message : "Could not delete the account.");
                  setDeleting(false);
                }
              }}
            >
              {deleting && <Spinner />} Delete forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
