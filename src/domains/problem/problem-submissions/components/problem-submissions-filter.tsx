import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { cn } from "@/shared/lib/utils";
import { SubmissionFilterType } from "../models/submission-filter-type";
import { SubmissionOrderByType } from "../models/submission-order-by-type";
import { useProblemSubmissions } from "../api/use-problem-submissions";
import { useProblemSubmissionsFilterStore } from "../state/problem-submissions-filter-store-context";

type ProblemSubmissionsFilterProps = {
  slug?: string;
  isAuthenticated?: boolean;
  isDisabled?: boolean;
} & React.ComponentProps<"div">;

export default function ProblemSubmissionsFilter({
  slug,
  isAuthenticated,
  isDisabled,
  className,
  ...props
}: Readonly<ProblemSubmissionsFilterProps>) {
  const filterType = useProblemSubmissionsFilterStore((s) => s.type);
  const sortBy = useProblemSubmissionsFilterStore((s) => s.sortBy);
  const setType = useProblemSubmissionsFilterStore((s) => s.setType);
  const setSortBy = useProblemSubmissionsFilterStore((s) => s.setSortBy);

  // Same (slug, type, sortBy) key as the sibling `ProblemSubmissions` list.
  // React Query dedupes this against that request instead of firing a
  // second network call, so this is "free" loading state, not an extra fetch.
  const { isLoading, isFetchingNextPage } = useProblemSubmissions({
    slug: slug ?? "",
    type: filterType,
    sortBy,
    enabled: !!isAuthenticated && !!slug,
  });

  const disabled = isDisabled || isLoading || isFetchingNextPage;

  return (
    <Card className={cn("h-fit", className)} {...props}>
      <CardHeader>
        <CardTitle>Filter Submissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <RadioGroup
            value={filterType}
            onValueChange={(value) => setType(value as SubmissionFilterType)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={SubmissionFilterType.UserSolutions}
                id="user-solutions"
                disabled={disabled}
              />
              <Label htmlFor="user-solutions">User Solutions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={SubmissionFilterType.MySubmissions}
                id="my-submissions"
                disabled={disabled}
              />
              <Label htmlFor="my-submissions">My Submissions</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <h3 className="font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm mb-3">
            Sort By
          </h3>
          <RadioGroup
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SubmissionOrderByType)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={SubmissionOrderByType.Newest}
                id="newest"
                disabled={disabled}
              />
              <Label htmlFor="newest">Newest</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={SubmissionOrderByType.Oldest}
                id="oldest"
                disabled={disabled}
              />
              <Label htmlFor="oldest">Oldest</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
