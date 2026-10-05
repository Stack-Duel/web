import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Checkbox } from "@/shared/components/ui/checkbox";
import type { ProgrammingLanguage } from "@/domains/language/models/programming-language";

type SetupLanguageTableProps = {
  languages: Pick<ProgrammingLanguage, "id" | "name">[];
  selectedIds: Set<string>;
  onSelectedIdsChange: (selectedIds: Set<string>) => void;
  groupLabel?: string;
};

export default function SetupLanguageTable({
  languages,
  selectedIds,
  onSelectedIdsChange,
  groupLabel,
}: Readonly<SetupLanguageTableProps>) {
  const allSelected =
    languages.length > 0 && languages.every((l) => selectedIds.has(l.id));
  const someSelected = languages.some((l) => selectedIds.has(l.id));

  const toggleAll = (checked: boolean) => {
    onSelectedIdsChange(
      checked ? new Set(languages.map((l) => l.id)) : new Set()
    );
  };

  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    onSelectedIdsChange(next);
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected || (someSelected && "indeterminate")}
                onCheckedChange={(checked) => toggleAll(!!checked)}
                aria-label={
                  groupLabel
                    ? `Select all ${groupLabel} languages`
                    : "Select all languages"
                }
              />
            </TableHead>
            <TableHead>Language</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {languages.map((language) => (
            <TableRow key={language.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(language.id)}
                  onCheckedChange={(checked) =>
                    toggleOne(language.id, !!checked)
                  }
                  aria-label={`Select ${language.name}`}
                />
              </TableCell>
              <TableCell>{language.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
