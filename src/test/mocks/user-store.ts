import { useUserStore } from "@/domains/user/state/user-store";

const initialState = useUserStore.getState();

export function resetUserStore() {
  useUserStore.setState({ ...initialState, hasCheckedAuth: true }, true);
}

export function resetUserStoreBeforeAuthCheck() {
  useUserStore.setState(initialState, true);
}
