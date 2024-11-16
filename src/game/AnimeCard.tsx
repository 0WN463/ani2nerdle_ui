import { useQuery } from "@tanstack/react-query";

type AnimeDetails = {
  id: number;
  title?: string;
  englishTitle?: string;
  imageUrl?: string;
};

const useAnimeDetails = (id: number) =>
  useQuery({
    queryKey: ["animeDetails", id],
    queryFn: async () => {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
      const res = await response.json();

      return {
        id,
        title: res?.data?.title,
        title_english: res?.data?.title_english,
        imageUrl: res?.data?.images?.webp?.image_url,
      } as AnimeDetails;
    },
  });

const AnimeCard = ({ id }: { id: number }) => {
  const { isLoading, data: details } = useAnimeDetails(id);
  if (isLoading || !details) return <div>Loading...</div>;

  return (
    <figure className="items-center flex flex-col">
      <img src={details.imageUrl} alt={details?.title} />
      <figcaption>{details?.title}</figcaption>
    </figure>
  );
};

export default AnimeCard;
