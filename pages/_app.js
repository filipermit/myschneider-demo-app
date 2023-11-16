import { ClerkProvider } from "@clerk/nextjs";
import { AbilityLoader } from "../utils/AbilityLoader";
import "../styles/global.css";

function MyApp({ Component, pageProps }) {
	return (
		<ClerkProvider {...pageProps}>
			<AbilityLoader>
				<Component {...pageProps} />
			</AbilityLoader>
		</ClerkProvider>
	);
}

export default MyApp;
