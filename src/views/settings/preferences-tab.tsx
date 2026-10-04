"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/shared/components/ui/field";
import { useTracks } from "@/domains/game/api/use-tracks";
import {
  accountQueryOptions,
  useAccount,
} from "@/domains/user/api/get-account";
import { useUpdateUsername } from "@/domains/user/api/update-username";
import { useUserStore } from "@/domains/user/state/user-store";
import SetupLanguageTable from "@/domains/user/components/setup-language-table";
import PriorityOrderList from "@/domains/user/components/priority-order-list";
import type { User } from "@/domains/user/models/user";
import type { Track } from "@/domains/game/models/track";

export default function PreferencesTab() {
  const { data: account, isLoading: isAccountLoading } = useAccount();
  const { data: tracks, isLoading: isTracksLoading } = useTracks();

  if (isAccountLoading || isTracksLoading || !account || !tracks) {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return <LanguagePreferencesForm account={account} tracks={tracks} />;
}

type LanguagePreferencesFormProps = {
  account: User;
  tracks: Track[];
};

function buildInitialStackState(
  tracks: Track[],
  languagePreferenceIds: string[]
) {
  const trackKeyByLanguageId = new Map<string, string>();
  for (const track of tracks) {
    for (const language of track.languages) {
      trackKeyByLanguageId.set(language.id, track.key);
    }
  }

  const selectedByTrack = new Map<string, Set<string>>();
  const languageOrderByTrack = new Map<string, string[]>();

  for (const languageId of languagePreferenceIds) {
    const trackKey = trackKeyByLanguageId.get(languageId);
    if (!trackKey) continue;

    if (!selectedByTrack.has(trackKey)) {
      selectedByTrack.set(trackKey, new Set());
      languageOrderByTrack.set(trackKey, []);
    }
    selectedByTrack.get(trackKey)?.add(languageId);
    languageOrderByTrack.get(trackKey)?.push(languageId);
  }

  return { selectedByTrack, languageOrderByTrack };
}

function LanguagePreferencesForm({
  account,
  tracks,
}: Readonly<LanguagePreferencesFormProps>) {
  const queryClient = useQueryClient();
  const userLoaded = useUserStore((s) => s.userLoaded);

  const tracksWithLanguages = tracks.filter(
    (track) => track.languages.length > 0
  );

  const initial = buildInitialStackState(tracks, account.languagePreferenceIds);

  const [selectedByTrack, setSelectedByTrack] = useState<
    Map<string, Set<string>>
  >(initial.selectedByTrack);
  const [languageOrderByTrack, setLanguageOrderByTrack] = useState<
    Map<string, string[]>
  >(initial.languageOrderByTrack);

  const mutation = useUpdateUsername({
    mutationConfig: {
      onSuccess: async () => {
        const freshAccount = await queryClient.fetchQuery({
          ...accountQueryOptions({}),
          staleTime: 0,
        });
        userLoaded(freshAccount);
        toast.success("Preferences updated");
      },
    },
  });

  const handleTrackLanguagesChange = (
    trackKey: string,
    nextLanguageIds: Set<string>
  ) => {
    setSelectedByTrack((prev) => {
      const next = new Map(prev);
      if (nextLanguageIds.size === 0) {
        next.delete(trackKey);
      } else {
        next.set(trackKey, nextLanguageIds);
      }
      return next;
    });
    setLanguageOrderByTrack((prev) => {
      const next = new Map(prev);
      const prevOrder = prev.get(trackKey) ?? [];
      const kept = prevOrder.filter((id) => nextLanguageIds.has(id));
      const added = [...nextLanguageIds].filter(
        (id) => !prevOrder.includes(id)
      );
      const order = [...kept, ...added];
      if (order.length === 0) {
        next.delete(trackKey);
      } else {
        next.set(trackKey, order);
      }
      return next;
    });
  };

  const handleTrackOrderChange = (trackKey: string, nextOrder: string[]) => {
    setLanguageOrderByTrack((prev) => {
      const next = new Map(prev);
      next.set(trackKey, nextOrder);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const languageIds = tracksWithLanguages.flatMap(
      (track) => languageOrderByTrack.get(track.key) ?? []
    );
    mutation.mutate({
      username: account.username,
      bio: account.bio,
      languageIds,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Edit your personal preferences like languages.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 mb-4">
          <FieldSet>
            <FieldLegend variant="label">Languages</FieldLegend>
            <FieldDescription>
              Select the languages you&apos;re comfortable coding in for each
              tech stack, and drag to rank them within that stack.
            </FieldDescription>
            {tracksWithLanguages.length > 0 ? (
              <div className="space-y-8">
                {tracksWithLanguages.map((track) => {
                  const selectedIds =
                    selectedByTrack.get(track.key) ?? new Set<string>();
                  const orderedIds = languageOrderByTrack.get(track.key) ?? [];

                  return (
                    <div key={track.id} className="space-y-3">
                      <FieldTitle>{track.name}</FieldTitle>
                      <SetupLanguageTable
                        languages={track.languages}
                        selectedIds={selectedIds}
                        onSelectedIdsChange={(next) =>
                          handleTrackLanguagesChange(track.key, next)
                        }
                        groupLabel={track.name}
                      />
                      {orderedIds.length > 0 ? (
                        <PriorityOrderList
                          items={track.languages}
                          orderedIds={orderedIds}
                          onOrderedIdsChange={(next) =>
                            handleTrackOrderChange(track.key, next)
                          }
                        />
                      ) : (
                        <FieldDescription>
                          Select at least one language to set an order.
                        </FieldDescription>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <FieldDescription>
                No tech stacks with available languages yet.
              </FieldDescription>
            )}
          </FieldSet>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
