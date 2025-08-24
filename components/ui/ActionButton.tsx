import { Button } from './button';
import { LiaEditSolid } from 'react-icons/lia';
import { LuTrash2 } from 'react-icons/lu';
import { IoReload } from 'react-icons/io5';
import { useFormStatus } from 'react-dom';

type actionType = 'edit' | 'delete';

export const ActionButton = ({
  actionType,
  onClick,
}: {
  actionType: actionType;
  onClick?: () => void;
}) => {
  const { pending } = useFormStatus();
  const renderIcon = () => {
    switch (actionType) {
      case 'edit':
        return <LiaEditSolid />;
      case 'delete':
        return <LuTrash2 />;
      default:
        const never: never = actionType;
        throw new Error(`Invalid action type: ${never}`);
    }
  };

  return (
    <Button
      type="submit"
      variant="ghost"
      onClick={onClick}
      disabled={pending}
      className="p-2 rounded-full"
      size="icon">
      {pending ? (
        <IoReload className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        renderIcon()
      )}
    </Button>
  );
};
