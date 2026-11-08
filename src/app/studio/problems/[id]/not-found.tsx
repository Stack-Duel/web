import NotFoundCard from "@/shared/components/not-found-card/not-found-card";

export default function NotFound() {
  return (
    <NotFoundCard
      title="Problem not found"
      description="We could not find your problem. It could've been removed or the link pointing to an old location."
    />
  );
}
