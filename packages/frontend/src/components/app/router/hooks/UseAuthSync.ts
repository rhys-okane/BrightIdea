import { useAuth0 } from "@auth0/auth0-react";
import { API_URL } from "@src/lib/api/constants/ApiConstants";
import { useUserState } from "@src/store/hooks/UseUserState";
import { useEffect } from "react";

export const useAuthSync = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const [, setUser] = useUserState();

  return useEffect(() => {
    (async () => {
      if (isAuthenticated && user) {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${await getAccessTokenSilently()}`,
          },
        });

        const json = (await response.json()) as { isAdmin: boolean };

        setUser({
          ...user,
          role: json.isAdmin ? "Admin" : "User",
        });
      }
    })();
  }, [getAccessTokenSilently, isAuthenticated, setUser, user]);
};
