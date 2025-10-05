import {type FC} from "react";
import "../../Main.css";
import {Router} from "@src/components/app/router/Router";
import {ToastContainer} from "react-toastify";

export const App: FC = () => {
	return (
		<>
			<Router />
			<ToastContainer theme="dark" />
		</>
	);
};

export default App;
