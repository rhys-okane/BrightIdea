import { type FC } from "react";
import "../../Main.css";
import { ToastContainer } from "react-toastify";
import { Router } from "./router/Router";
import { Auth0Provider } from "@auth0/auth0-react";

export const App: FC = () => {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://bright-idea-azure-functions",
      }}
      cacheLocation="localstorage"
    >
      <Router />
      <ToastContainer theme="dark" />
    </Auth0Provider>
  );
};

export default App;
