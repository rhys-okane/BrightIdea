import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@src/components/ui/popover";
import { useUserState } from "@src/store/hooks/UseUserState";
import { useState, type FC } from "react";

export const Profile: FC = () => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [user] = useUserState();
  const { logout } = useAuth0();

  if (!user) return null;

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className="h-fit hover:cursor-pointer"
            onClick={() => setPopoverOpen(!popoverOpen)}
          >
            <img
              src={user.picture}
              alt={user.preferred_username}
              className="h-9 rounded-full"
              width="36"
              height="36"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div>
            <span className="text-xl font-medium">{user.name}</span>
            <div className="text-muted-color text-lg">{user.email}</div>
          </div>
          <div className="text-muted-color flex items-center gap-2 text-base">
            {user.role}
          </div>
          <Button onClick={() => logout()}>Log Out</Button>
        </PopoverContent>
      </Popover>
    </>
  );
};
