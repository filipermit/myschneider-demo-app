import React, { createContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Ability } from "@casl/ability";
import { Permit, permitState } from "permit-fe-sdk";

// Create Context
export const AbilityContext = createContext();

export const AbilityLoader = ({ children }) => {
	const { isSignedIn, user } = useUser();
	const [ability, setAbility] = useState(undefined);

	useEffect(() => {
		const getAbility = async (loggedInUser) => {
			const permit = Permit({
				loggedInUser: loggedInUser,
				backendUrl: "/api/dashboardBulk",
			});

			await permit.loadLocalStateBulk([
				{ action: "view", resource: "Products" },
				{ action: "view", resource: "Product_Configurators" },
				{ action: "view", resource: "Project_Builder" },
				{ action: "view", resource: "Topics_for_you" },
				{
					action: "view",
					resource: "Topics_for_you",
					resourceAttributes: { country: "PL", channel: "SI" },
				},
				{
					action: "view",
					resource: "Topics_for_you",
					resourceAttributes: { country: "UK", channel: "BE" },
				},
			]);

			const caslConfig = permitState.getCaslJson();

			console.log(caslConfig);

			return caslConfig && caslConfig.length
				? new Ability(caslConfig)
				: undefined;
		};

		if (isSignedIn) {
			getAbility(user.id).then((caslAbility) => {
				setAbility(caslAbility);
			});
		}
	}, [isSignedIn, user]);

	return (
		<AbilityContext.Provider value={ability}>
			{children}
		</AbilityContext.Provider>
	);
};
