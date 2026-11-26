import { beforeEach, describe, expect, it } from "vitest";
import { useGameSessionStore } from "./game-session-store";

describe("useGameSessionStore", () => {
  beforeEach(() => {
    useGameSessionStore.getState().reset();
  });

  it("starts with no pending next problem and no problem being viewed", () => {
    const state = useGameSessionStore.getState();

    expect(state.hasSolvedCurrentProblem).toBe(false);
    expect(state.nextProblemId).toBeNull();
    expect(state.viewingProblemId).toBeNull();
  });

  it("records the next problem id when a problem is solved", () => {
    useGameSessionStore.getState().problemSolved("problem-2");

    expect(useGameSessionStore.getState().hasSolvedCurrentProblem).toBe(true);
    expect(useGameSessionStore.getState().nextProblemId).toBe("problem-2");
  });

  it("records null when the last problem is solved", () => {
    useGameSessionStore.getState().problemSolved(null);

    expect(useGameSessionStore.getState().hasSolvedCurrentProblem).toBe(true);
    expect(useGameSessionStore.getState().nextProblemId).toBeNull();
  });

  it("clears the pending id and viewed problem once the next problem starts loading", () => {
    useGameSessionStore.getState().problemSolved("problem-2");
    useGameSessionStore.getState().viewProblem("problem-1");

    useGameSessionStore.getState().nextProblemLoading();

    expect(useGameSessionStore.getState().hasSolvedCurrentProblem).toBe(false);
    expect(useGameSessionStore.getState().nextProblemId).toBeNull();
    expect(useGameSessionStore.getState().viewingProblemId).toBeNull();
  });

  it("tracks which problem is being viewed and returns to the current one", () => {
    useGameSessionStore.getState().viewProblem("problem-1");
    expect(useGameSessionStore.getState().viewingProblemId).toBe("problem-1");

    useGameSessionStore.getState().returnToCurrentProblem();
    expect(useGameSessionStore.getState().viewingProblemId).toBeNull();
  });

  it("resets both pending next problem and viewed problem", () => {
    useGameSessionStore.getState().problemSolved("problem-2");
    useGameSessionStore.getState().viewProblem("problem-1");

    useGameSessionStore.getState().reset();

    expect(useGameSessionStore.getState().hasSolvedCurrentProblem).toBe(false);
    expect(useGameSessionStore.getState().nextProblemId).toBeNull();
    expect(useGameSessionStore.getState().viewingProblemId).toBeNull();
  });

  it("records feed entries newest first", () => {
    useGameSessionStore.getState().addFeedEntry({
      id: "1",
      type: "attempt",
      userId: "user-1",
      status: "WrongAnswer",
      createdAt: "t1",
    });
    useGameSessionStore.getState().addFeedEntry({
      id: "2",
      type: "reaction",
      userId: "user-2",
      emoji: "🔥",
      createdAt: "t2",
    });

    expect(useGameSessionStore.getState().feed.map((e) => e.userId)).toEqual([
      "user-2",
      "user-1",
    ]);
  });

  it("supports both attempt and reaction feed entries", () => {
    useGameSessionStore.getState().addFeedEntry({
      id: "1",
      type: "attempt",
      userId: "user-1",
      status: "Accepted",
      createdAt: "t1",
    });
    useGameSessionStore.getState().addFeedEntry({
      id: "2",
      type: "reaction",
      userId: "user-1",
      emoji: "🎉",
      createdAt: "t2",
    });

    const [reaction, attempt] = useGameSessionStore.getState().feed;
    expect(attempt).toMatchObject({ type: "attempt", status: "Accepted" });
    expect(reaction).toMatchObject({ type: "reaction", emoji: "🎉" });
  });

  it("caps the feed at 50 entries", () => {
    for (let i = 0; i < 55; i++) {
      useGameSessionStore.getState().addFeedEntry({
        id: `${i}`,
        type: "reaction",
        userId: `user-${i}`,
        emoji: "👍",
        createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(),
      });
    }

    expect(useGameSessionStore.getState().feed).toHaveLength(50);
    expect(useGameSessionStore.getState().feed[0].userId).toBe("user-54");
  });

  it("drops a repeated entry with the same id", () => {
    const entry = {
      id: "attempt:user-1:2026-01-01T00:00:00.000Z",
      type: "attempt" as const,
      userId: "user-1",
      status: "Accepted" as const,
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    useGameSessionStore.getState().addFeedEntry(entry);
    useGameSessionStore.getState().addFeedEntry(entry);

    expect(useGameSessionStore.getState().feed).toHaveLength(1);
  });

  it("orders the feed by its payload timestamps, not arrival order", () => {
    useGameSessionStore.getState().addFeedEntry({
      id: "later",
      type: "reaction",
      userId: "user-later",
      emoji: "🔥",
      createdAt: "2026-01-01T00:00:05.000Z",
    });
    useGameSessionStore.getState().addFeedEntry({
      id: "earlier",
      type: "reaction",
      userId: "user-earlier",
      emoji: "👍",
      createdAt: "2026-01-01T00:00:01.000Z",
    });

    expect(
      useGameSessionStore.getState().feed.map((entry) => entry.id)
    ).toEqual(["later", "earlier"]);
  });

  it("records the problem id out for grading when grading starts", () => {
    useGameSessionStore.getState().gradingStarted("problem-1");

    expect(useGameSessionStore.getState().gradingProblemId).toBe("problem-1");
  });

  it("clears the grading problem id once grading settles", () => {
    useGameSessionStore.getState().gradingStarted("problem-1");

    useGameSessionStore.getState().gradingSettled();

    expect(useGameSessionStore.getState().gradingProblemId).toBeNull();
  });

  it("clears the grading problem id on reset", () => {
    useGameSessionStore.getState().gradingStarted("problem-1");

    useGameSessionStore.getState().reset();

    expect(useGameSessionStore.getState().gradingProblemId).toBeNull();
  });

  it("clears the feed on reset", () => {
    useGameSessionStore.getState().addFeedEntry({
      id: "1",
      type: "reaction",
      userId: "user-1",
      emoji: "👍",
      createdAt: "t1",
    });

    useGameSessionStore.getState().reset();

    expect(useGameSessionStore.getState().feed).toEqual([]);
  });
});
