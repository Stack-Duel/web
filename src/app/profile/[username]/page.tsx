import ProfileLayout from "@/views/profile/profile-layout";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const [username, tenant] = await Promise.all([
    params.then((p) => p.username),
    getCurrentTenant(),
  ]);
  return {
    title: `${username}'s Profile`,
    description: `View ${username}'s profile on ${tenant.name}, an online competitive coding platform. See game stats, submission history, and code battle results.`,
  };
};

export default async function ProfilePage({
  params,
}: Readonly<{
  params: Promise<{ username: string }>;
}>) {
  const username = (await params).username;

  return <ProfileLayout username={username} />;
}
