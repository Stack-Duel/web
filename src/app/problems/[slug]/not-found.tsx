import NotFoundCard from "@/shared/components/not-found-card/not-found-card";

export default function NotFound() {
  return (
    <NotFoundCard
      title="Problem not found"
      description="We could not find the problem you are looking for. It may have been removed, renamed, or the link is incorrect."
    />
  );
}
