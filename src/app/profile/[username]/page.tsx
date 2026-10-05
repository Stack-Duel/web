import ProfileLayout from "@/views/profile/profile-layout";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const username = (await params).username;
  return {
    title: `${username}'s Profile`,
    description: `View ${username}'s profile on Algowars, an online competitive coding platform. See game stats, submission history, and code battle results.`,
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
