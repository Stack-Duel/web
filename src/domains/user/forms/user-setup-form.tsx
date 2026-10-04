"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { routerConfig } from "@/shared/router-config";
import { usernameSchema } from "../schemas/username-schema";
import { useUpdateUsername } from "../api/update-username";
import { accountQueryOptions, useSuspenseAccount } from "../api/get-account";
import { useUserStore } from "../state/user-store";
import { useSuspenseLanguages } from "@/domains/language/api/get-languages";
import SetupLanguageTable from "../components/setup-language-table";
import PriorityOrderList from "../components/priority-order-list";
import SetupFormSkeleton from "../components/setup-form-skeleton";
import {
  Questionnaire,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireTitle,
} from "@/shared/components/ui/questionnaire";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { FieldDescription } from "@/shared/components/ui/field";

const STEPS = ["username", "bio", "languages", "order"] as const;
type Step = (typeof STEPS)[number];

const BIO_MAX_LENGTH = 500;

export default function UserSetupForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useSuspenseAccount();
  const { data: languages } = useSuspenseLanguages();
  const userLoaded = useUserStore((s) => s.userLoaded);

  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [bio, setBio] = useState("");
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<Set<string>>(
    new Set()
  );
  // Kept in a separate list (rather than derived from the Set) so drag
  // reordering has something stable to reorder: newly checked languages are
  // appended, unchecked ones drop out, already-ranked ones keep their spot.
  const [languageOrder, setLanguageOrder] = useState<string[]>([]);

  const mutation = useUpdateUsername({
    mutationConfig: {
      onSuccess: async () => {
        // The PUT response body is just an ack, not the updated user, so fetch fresh
        // account data so the sidebar (which reads from this store) picks up the
        // new username/roles/permissions instead of getting wiped by a stale value.
        const account = await queryClient.fetchQuery({
          ...accountQueryOptions({}),
          staleTime: 0,
        });
        userLoaded(account);
        router.push(routerConfig.home.path);
      },
    },
  });

  const alreadyCompletedSetup = !!user?.setupCompletedAt;

  useEffect(() => {
    if (alreadyCompletedSetup) {
      router.push(routerConfig.home.path);
    }
  }, [alreadyCompletedSetup, router]);

  const usernameValid = usernameSchema.safeParse(username).success;
  const bioValid = bio.length <= BIO_MAX_LENGTH;
  const hasSelectedLanguages = selectedLanguageIds.size > 0;

  const canAdvance: Record<Step, boolean> = {
    username: usernameValid,
    bio: bioValid,
    languages: hasSelectedLanguages,
    order: true,
  };

  const goNext = () => {
    const index = STEPS.indexOf(step);
    if (index < STEPS.length - 1) {
      setStep(STEPS[index + 1]);
    }
  };

  const handleSelectedLanguagesChange = (next: Set<string>) => {
    setSelectedLanguageIds(next);
    setLanguageOrder((prev) => {
      const kept = prev.filter((id) => next.has(id));
      const added = [...next].filter((id) => !prev.includes(id));
      return [...kept, ...added];
    });
  };

  const finishSetup = () => {
    mutation.mutate({ username, bio, languageIds: languageOrder });
  };

  if (alreadyCompletedSetup) {
    return <SetupFormSkeleton />;
  }

  return (
    <Questionnaire
      item={step}
      onItemChange={(item) => setStep(item as Step)}
      onSubmit={(e) => e.preventDefault()}
    >
      <QuestionnaireProgress />

      <QuestionnaireItem
        name="username"
        required
        invalid={usernameTouched && !usernameValid}
      >
        <QuestionnaireTitle>What should we call you?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Pick a username. You can change it again in 30 days.
        </QuestionnaireDescription>
        <QuestionnaireInput
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setUsernameTouched(true);
          }}
          onBlur={() => setUsernameTouched(true)}
          placeholder="Username"
          autoComplete="off"
          data-testid="user-setup-username"
        />
        <QuestionnaireError>
          Username must be 1-20 characters and contain only letters, numbers,
          hyphens, and underscores.
        </QuestionnaireError>
      </QuestionnaireItem>

      <QuestionnaireItem name="bio" invalid={!bioValid}>
        <QuestionnaireTitle>Tell us about yourself</QuestionnaireTitle>
        <QuestionnaireDescription>
          Optional - shown on your public profile.
        </QuestionnaireDescription>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell other players a bit about yourself"
          rows={4}
          aria-invalid={!bioValid}
        />
        <QuestionnaireError>
          Bio must be at most {BIO_MAX_LENGTH} characters.
        </QuestionnaireError>
      </QuestionnaireItem>

      <QuestionnaireItem name="languages" required>
        <QuestionnaireTitle>Which languages do you know?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Select all the programming languages you&apos;re comfortable coding
          in.
        </QuestionnaireDescription>
        <SetupLanguageTable
          languages={languages}
          selectedIds={selectedLanguageIds}
          onSelectedIdsChange={handleSelectedLanguagesChange}
        />
        {!hasSelectedLanguages && (
          <FieldDescription>
            Select at least one language to continue.
          </FieldDescription>
        )}
      </QuestionnaireItem>

      <QuestionnaireItem name="order">
        <QuestionnaireTitle>Rank your languages</QuestionnaireTitle>
        <QuestionnaireDescription>
          Drag to put your most preferred language first.
        </QuestionnaireDescription>
        <PriorityOrderList
          items={languages}
          orderedIds={languageOrder}
          onOrderedIdsChange={setLanguageOrder}
        />
      </QuestionnaireItem>

      <div className="flex items-center gap-2">
        <QuestionnairePrevious />
        {step === "bio" && <QuestionnaireSkip>Skip</QuestionnaireSkip>}
        {step === "order" ? (
          <Button
            type="button"
            className="ms-auto"
            disabled={mutation.isPending}
            onClick={finishSetup}
          >
            {mutation.isPending ? "Saving..." : "Finish setup"}
          </Button>
        ) : (
          <Button
            type="button"
            className="ms-auto"
            disabled={!canAdvance[step]}
            onClick={goNext}
          >
            Next
          </Button>
        )}
      </div>
      {mutation.error?.message && (
        <p className="text-sm text-destructive">{mutation.error.message}</p>
      )}
    </Questionnaire>
  );
}
