import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";

// Adapted from https://raw.githubusercontent.com/uidotdev/usehooks/refs/heads/main/index.js
const useDebounce = <T,>(value: T, delay: number) => {
  const [state, setState] = useState<T>(value);
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(state);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [state, delay]);

  return [debouncedValue, setState] as const;
};

const SearchBar = ({
  onSelect,
  isDisabled,
}: {
  onSelect: (id: number) => void;
  isDisabled: (id: number) => boolean;
}) => {
  const [searchTerm, setSearchTerm] = useDebounce("", 300);

  const { error, data: res } = useQuery({
    queryKey: ["searchAnime", searchTerm],
    queryFn: async () => {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${searchTerm}&sfw=true`,
      );
      return await response.json();
    },
    enabled: searchTerm !== "",
  });

  const formatLabel = (a: any) => (
    <>
      <header style={{ fontWeight: "bold" }}>{a?.title}</header>
      <div>{a?.title_english}</div>
    </>
  );

  const options = res?.data?.map((a: any) => ({
    value: a?.mal_id,
    label: formatLabel(a),
    isDisabled: isDisabled(a?.mal_id),
  }));

  const errorDisplay = error ? (
    <div>
      An error has occurred
      {error instanceof Error ? error.message : "Unknown error"}
    </div>
  ) : null;

  return (
    <>
      {errorDisplay}
      <Select
        onInputChange={setSearchTerm}
        options={options}
        onChange={(e: any) => onSelect(e.value)}
        filterOption={() => true}
      />
    </>
  );
};

export default SearchBar;
