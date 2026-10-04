import { beforeEach, describe, expect, it } from "vitest";
import { useGameSessionStore } from "./game-session-store";

describe("useGameSessionStore", () => {
  beforeEach(() => {
    useGameSessionStore.getState().reset();
  });

  it("starts with no pending next problem and no problem being viewed", () => {
    const state = useGameSessionStore.getState();

    expect(state.pendingNextProblemId).toBeUndefined();
    expect(state.viewingProblemId).toBeNull();
  });

  it("records the next problem id when a problem is solved", () => {
    useGameSessionStore.getState().problemSolved("problem-2");

    expect(useGameSessionStore.getState().pendingNextProblemId).toBe(
      "problem-2"
    );
  });

  it("records null when the last problem is solved", () => {
    useGameSessionStore.getState().problemSolved(null);

    expect(useGameSessionStore.getState().pendingNextProblemId).toBeNull();
  });

  it("clears the pending id and viewed problem once the next problem starts loading", () => {
    useGameSessionStore.getState().problemSolved("problem-2");
    useGameSessionStore.getState().viewProblem("problem-1");

    useGameSessionStore.getState().nextProblemLoading();

    expect(useGameSessionStore.getState().pendingNextProblemId).toBeUndefined();
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

    expect(useGameSessionStore.getState().pendingNextProblemId).toBeUndefined();
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
        createdAt: `t${i}`,
      });
    }

    expect(useGameSessionStore.getState().feed).toHaveLength(50);
    expect(useGameSessionStore.getState().feed[0].userId).toBe("user-54");
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
