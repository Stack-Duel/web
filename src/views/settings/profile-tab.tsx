"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { routerConfig } from "@/shared/router-config";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Lock, Globe } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import AvatarPicker from "@/domains/user/components/avatar-picker";
import { profileSettingsSchema } from "@/domains/user/schemas/profile-settings-schema";
import { useUpdateUsername } from "@/domains/user/api/update-username";
import {
  accountQueryOptions,
  useAccount,
} from "@/domains/user/api/get-account";
import { useUpdateProfilePrivacy } from "@/domains/user/api/update-profile-privacy";
import { selectAvatarUrl, useUserStore } from "@/domains/user/state/user-store";
import type { User } from "@/domains/user/models/user";

const USERNAME_COOLDOWN_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default function ProfileTab() {
  const { data: account, isLoading } = useAccount();
  const queryClient = useQueryClient();
  const router = useRouter();
  const userLoaded = useUserStore((s) => s.userLoaded);
  // Captured once at mount rather than read live: comparing against a stable
  // "now" keeps this render pure (see react-hooks/purity), and day-granularity
  // staleness is irrelevant for a 30-day cooldown.
  const [now] = useState(() => Date.now());

  const mutation = useUpdateUsername({
    mutationConfig: {
      onSuccess: async () => {
        // The PUT response body is just an ack, not the updated user, so fetch fresh
        // account data so the sidebar (which reads from this store) picks up the
        // new username/bio/roles instead of getting wiped by a stale value.
        const freshAccount = await queryClient.fetchQuery({
          ...accountQueryOptions({}),
          staleTime: 0,
        });
        userLoaded(freshAccount);
        toast.success("Profile updated");
        router.push(
          routerConfig.profile.execute({ username: freshAccount.username })
        );
      },
    },
  });

  if (isLoading || !account) {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const lastChangedAt = account.usernameLastChangedAt
    ? new Date(account.usernameLastChangedAt)
    : null;
  const nextEligibleAt = lastChangedAt
    ? new Date(lastChangedAt.getTime() + USERNAME_COOLDOWN_DAYS * MS_PER_DAY)
    : null;
  const isUsernameLocked = !!nextEligibleAt && nextEligibleAt.getTime() > now;

  return (
    <div className="space-y-4">
      <AvatarCard />
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This is what other players see on your public profile.
          </CardDescription>
        </CardHeader>
        <ProfileForm
          username={account.username}
          bio={account.bio ?? ""}
          isUsernameLocked={isUsernameLocked}
          nextEligibleAt={nextEligibleAt}
          mutation={mutation}
        />
      </Card>
      <PrivacyCard account={account} />
    </div>
  );
}

const AVATAR_SIZE_PREVIEWS = [
  { size: "sm", label: "Small" },
  { size: "default", label: "Default" },
  { size: "lg", label: "Large" },
] as const;

function AvatarCard() {
  const avatarUrl = useUserStore(selectAvatarUrl);
  const displayName = useUserStore((s) => s.user?.username);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avatar</CardTitle>
        <CardDescription>
          Shown next to your username across the app. Pick a previous avatar or
          upload a new one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-end gap-6">
          {AVATAR_SIZE_PREVIEWS.map(({ size, label }) => (
            <div key={size} className="flex flex-col items-center gap-1.5">
              <Avatar size={size}>
                <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
                <AvatarFallback>
                  {displayName?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        <AvatarPicker />
      </CardContent>
    </Card>
  );
}

function PrivacyCard({ account }: Readonly<{ account: User }>) {
  const mutation = useUpdateProfilePrivacy();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy</CardTitle>
        <CardDescription>
          Controls who can see your game mode stats, recent games, and recent
          submissions on your public profile. Your username, avatar, bio, and
          join date are always visible.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          {account.isPrivate ? (
            <Lock className="size-4 text-muted-foreground" />
          ) : (
            <Globe className="size-4 text-muted-foreground" />
          )}
          <span>
            {account.isPrivate
              ? "Your profile is private. Only you can see your stats, games, and submissions."
              : "Your profile is public. Anyone can see your stats, games, and submissions."}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate({ isPrivate: !account.isPrivate })}
        >
          {account.isPrivate ? "Make public" : "Make private"}
        </Button>
      </CardContent>
    </Card>
  );
}

type ProfileFormProps = {
  username: string;
  bio: string;
  isUsernameLocked: boolean;
  nextEligibleAt: Date | null;
  mutation: ReturnType<typeof useUpdateUsername>;
};

function ProfileForm({
  username,
  bio,
  isUsernameLocked,
  nextEligibleAt,
  mutation,
}: Readonly<ProfileFormProps>) {
  const form = useForm({
    defaultValues: { username, bio },
    validators: {
      onSubmit: profileSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        username: isUsernameLocked ? username : value.username,
        bio: value.bio,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <CardContent className="mb-3">
        <FieldGroup>
          <form.Field name="username">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isUsernameLocked}
                    autoComplete="off"
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>
                    {isUsernameLocked && nextEligibleAt
                      ? `You can change your username again on ${nextEligibleAt.toLocaleDateString()}.`
                      : "You can change your username once every 30 days."}
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="bio">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Tell other players a bit about yourself"
                    rows={4}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>
                    Up to 500 characters. Shown on your public profile.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  {mutation.error?.message && (
                    <FieldError
                      errors={[{ message: mutation.error?.message }]}
                    />
                  )}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </form>
  );
}
