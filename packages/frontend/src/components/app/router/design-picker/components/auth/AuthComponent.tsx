import { useAuth0 } from "@auth0/auth0-react";
import { Profile } from "@src/components/app/router/design-picker/components/auth/profile/Profile";
import { Button } from "@src/components/ui/button";

export const AuthComponent = () => {
  const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return;

  if (isAuthenticated && user) {
    return (
      <div className="absolute m-4 top-0 right-0">
        <Profile />
      </div>
    );
  }

  return (
    <div className="absolute m-4 top-0 right-0">
      <Button onClick={() => loginWithRedirect()} className="button login">
        Log In
      </Button>
    </div>
  );
};
