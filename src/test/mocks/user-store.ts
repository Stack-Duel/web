import { useUserStore } from "@/domains/user/state/user-store";

const initialState = useUserStore.getState();

export function resetUserStore() {
  useUserStore.setState(initialState, true);
}
