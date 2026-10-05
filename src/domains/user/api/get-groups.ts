import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { Group } from "../models/group";

export const getGroups = ({ signal }: RequestConfig) =>
  http.get<Group[]>("/api/v1/group", toAxiosConfig({ signal }));

const groupsQuery = defineQuery({
  queryKey: () => ["groups"],
  queryFn: getGroups,
  meta: { errorToast: "Error loading groups" },
});

export const useGroups = groupsQuery.useQuery;
