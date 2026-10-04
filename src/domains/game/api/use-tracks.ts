import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { Track } from "../models/track";

export const getTracks = ({ signal }: RequestConfig) =>
  http.get<Track[]>("/api/v1/game/tracks", toAxiosConfig({ signal }));

const tracksQuery = defineQuery({
  queryKey: () => ["tracks"],
  queryFn: getTracks,
  meta: { errorToast: "Error loading tracks" },
});

export const useTracks = tracksQuery.useQuery;
