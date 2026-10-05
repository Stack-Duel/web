"use client";

import Link from "next/link";
import { Lock, Swords, FileCode2, Pencil } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { routerConfig } from "@/shared/router-config";
import { useSuspenseUserProfile } from "@/domains/user/api/get-user-profile";
import { useFeatureFlag } from "@/domains/feature-flags/hooks/use-feature-flag";
import { FeatureFlags } from "@/domains/feature-flags/lib/well-known-features";
import RatingHistoryChart from "@/domains/rating/components/rating-history-chart";
import SubmissionCalendar from "./submission-calendar";
import type {
  ProfileGame,
  ProfileSubmission,
} from "@/domains/user/models/user-profile";

function getStatusVariant(status: ProfileSubmission["status"]) {
  return status === "WrongAnswer"
    ? ("destructive" as const)
    : ("secondary" as const);
}

function getStatusClassName(status: ProfileSubmission["status"]) {
  return status === "Accepted"
    ? "bg-green-600 text-white hover:bg-green-600/90"
    : undefined;
}

function GameParticipantRow({
  game,
  viewerUsername,
}: Readonly<{ game: ProfileGame; viewerUsername: string }>) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      {game.participants.map((participant) => (
        <span
          key={participant.username}
          className={
            participant.username === viewerUsername
              ? "font-semibold"
              : "text-muted-foreground"
          }
        >
          {participant.username}: {participant.score}
        </span>
      ))}
    </div>
  );
}

type ProfileContentProps = {
  username: string;
};

export default function ProfileContent({
  username,
}: Readonly<ProfileContentProps>) {
  const { data: profile } = useSuspenseUserProfile({ username });
  const ratingsEnabled = useFeatureFlag(FeatureFlags.RATINGS);

  const canSeeSections = profile.gameModeStats !== null;

  return (
    <div className="@container grid grid-cols-12 gap-4">
      <div className="col-span-12 @3xl:col-span-4 flex flex-col gap-4">
        <Card>
          <CardContent className="flex flex-col gap-3 py-6">
            <div className="flex items-center gap-3">
              <Avatar size="lg" className="size-14 shrink-0">
                <AvatarImage
                  src={profile.imageUrl ?? undefined}
                  alt={profile.username}
                />
                <AvatarFallback className="text-lg">
                  {profile.username[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-semibold truncate">
                    {profile.username}
                  </h1>
                  {profile.isPrivate ? (
                    <Badge variant="secondary" className="shrink-0">
                      <Lock className="size-3" />
                      Private
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Member since{" "}
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-sm">
              {profile.bio ? profile.bio : "No bio yet."}
            </p>
            {profile.isOwnProfile ? (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={routerConfig.settingsProfile.path}>
                  <Pencil />
                  Edit profile
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        {canSeeSections ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="size-4" />
                Game mode stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.gameModeStats!.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No completed games yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {profile.gameModeStats!.map((stat) => {
                    const winPct =
                      stat.gamesPlayed > 0
                        ? Math.round((stat.wins / stat.gamesPlayed) * 100)
                        : 0;
                    const lossPct =
                      stat.gamesPlayed > 0
                        ? Math.round((stat.losses / stat.gamesPlayed) * 100)
                        : 0;
                    const drawPct =
                      stat.gamesPlayed > 0
                        ? Math.round((stat.draws / stat.gamesPlayed) * 100)
                        : 0;

                    return (
                      <div
                        key={stat.gameModeKey}
                        className="flex flex-col gap-1.5 border-b pb-3 last:border-b-0 last:pb-0"
                      >
                        <span className="font-medium">{stat.gameModeName}</span>
                        <span className="text-sm text-muted-foreground">
                          {stat.gamesPlayed} played
                          {stat.hasOpponents
                            ? ` · ${stat.wins}W ${stat.losses}L ${stat.draws}D · ${winPct}% / ${lossPct}% / ${drawPct}%`
                            : ` · best score: ${stat.bestScore}`}
                        </span>
                        {stat.hasOpponents && stat.gamesPlayed > 0 ? (
                          <div
                            className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
                            role="img"
                            aria-label={`${winPct}% wins, ${lossPct}% losses, ${drawPct}% ties`}
                          >
                            {stat.wins > 0 ? (
                              <div
                                className="bg-emerald-500"
                                style={{ flex: stat.wins }}
                              />
                            ) : null}
                            {stat.losses > 0 ? (
                              <div
                                className="bg-red-500"
                                style={{ flex: stat.losses }}
                              />
                            ) : null}
                            {stat.draws > 0 ? (
                              <div
                                className="bg-amber-400"
                                style={{ flex: stat.draws }}
                              />
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="col-span-12 @3xl:col-span-8 flex flex-col gap-4">
        {!canSeeSections ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <Lock className="size-6" />
              <p>This profile is private.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {profile.submissionCalendar &&
            profile.submissionCalendarRangeStart &&
            profile.submissionCalendarRangeEnd ? (
              <SubmissionCalendar
                days={profile.submissionCalendar}
                rangeStart={profile.submissionCalendarRangeStart}
                rangeEnd={profile.submissionCalendarRangeEnd}
              />
            ) : null}

            {ratingsEnabled && profile.isOwnProfile ? (
              <RatingHistoryChart />
            ) : null}

            <Card>
              <Tabs defaultValue="games">
                <CardHeader>
                  <TabsList>
                    <TabsTrigger value="games">
                      <Swords className="size-4" />
                      Recent games
                    </TabsTrigger>
                    <TabsTrigger value="submissions">
                      <FileCode2 className="size-4" />
                      Recent submissions
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="games">
                    {profile.recentGames!.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No completed games yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {profile.recentGames!.map((game) => (
                          <div
                            key={game.gameId}
                            className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">
                                {game.gameModeName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {game.endedAt
                                  ? new Date(game.endedAt).toLocaleString()
                                  : ""}
                              </span>
                            </div>
                            <GameParticipantRow
                              game={game}
                              viewerUsername={profile.username}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="submissions">
                    {profile.recentSubmissions!.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No submissions yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {profile.recentSubmissions!.map((submission) => (
                          <div
                            key={submission.id}
                            className="grid grid-cols-1 gap-x-3 gap-y-1 border-b pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_7rem_12rem] sm:items-center"
                          >
                            <Link
                              href={routerConfig.problem.execute({
                                slug: submission.problemSlug,
                              })}
                              className="font-medium truncate hover:underline min-w-0"
                            >
                              {submission.problemTitle}
                            </Link>
                            <Badge
                              variant={getStatusVariant(submission.status)}
                              className={cn(
                                "w-fit",
                                getStatusClassName(submission.status)
                              )}
                            >
                              {submission.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {submission.language.name}{" "}
                              {submission.language.version} ·{" "}
                              {new Date(submission.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
