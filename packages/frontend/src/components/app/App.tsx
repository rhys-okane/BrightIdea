import {type FC} from "react";
import "../../Main.css";
import {ToastContainer} from "react-toastify";
import {Router} from "./router/Router";

export const App: FC = () => {
	return (
		<>
			<Router />
			<ToastContainer theme="dark" />
		</>
	);
};

export default App;
