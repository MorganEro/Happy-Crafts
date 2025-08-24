import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoReload } from 'react-icons/io5';

export const FavoriteSubmitIcon = ({
  isFavorite,
  isLoading,
}: {
  isFavorite: boolean;
  isLoading?: boolean;
}) => {
  return (
    <div className="p-2 rounded-full bg-white/40">
      {isLoading ? (
        <IoReload className="mr-2 h-4 w-4 animate-spin" />
      ) : isFavorite ? (
        <FaHeart className="text-orange-700 " />
      ) : (
        <FaRegHeart />
      )}
    </div>
  );
};
