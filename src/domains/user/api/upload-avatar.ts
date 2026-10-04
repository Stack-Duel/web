import { defineMutation } from "@/shared/api/define-mutation";
import type { RequestConfig } from "@/shared/lib/request-config";
import { http } from "@/shared/lib/http";

type UploadAvatarVariables = { file: File };

export const uploadAvatar = ({
  signal,
  file,
}: UploadAvatarVariables & RequestConfig) => {
  const formData = new FormData();
  formData.append("file", file);

  return http.post<string>("/api/v1/user/avatar", formData, {
    signal,
    headers: { "Content-Type": undefined as unknown as string },
  });
};

const uploadAvatarMutation = defineMutation<string, UploadAvatarVariables>({
  mutationFn: uploadAvatar,
  invalidateQueries: () => [["account"], ["avatar-history"]],
});

export const useUploadAvatar = uploadAvatarMutation.useMutation;
