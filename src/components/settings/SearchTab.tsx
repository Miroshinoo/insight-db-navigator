
import { AdvancedSearch } from "@/components/AdvancedSearch";

interface SearchTabProps {
  onSearch: (filters: any[], globalSearch: string) => void;
  availableTables: string[];
}

export const SearchTab = ({ onSearch, availableTables }: SearchTabProps) => {
  return (
    <AdvancedSearch 
      onSearch={onSearch}
      availableTables={availableTables}
    />
  );
};
