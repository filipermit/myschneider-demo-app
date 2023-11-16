import { Permit } from "permitio";

const permit = new Permit({
	token:
		"permit_key_Nc5wFg2TLvyNJAoa6Kdl2CfXKc50kd4w90OgRjuqqPPEzoZJgOP5elRo3W7P7nOF8YPHNBNOdakMKbbTv0jxJK",
	pdp: "http://localhost:7766",
});

export default async function handler(req, res) {
	try {
		const { resourcesAndActions } = req.body;
		const { user: userId } = req.query;

		if (!userId) {
			return res.status(400).json({ error: "No userId provided." });
		}

		console.log(resourcesAndActions);

		const checkPermissions = async (resourceAndAction) => {
			const { resource, action, resourceAttributes } = resourceAndAction;

			const allowed = permit.check(userId, action, {
				type: resource,
				attributes: resourceAttributes,
				tenant: "default",
			});

			return allowed;
		};

		const permittedList = await Promise.all(
			resourcesAndActions.map(checkPermissions)
		);

		console.log(permittedList);

		return res.status(200).json({ permittedList });
	} catch (error) {
		console.error(error); // It's a good practice to log the actual error for debugging purposes.
		return res.status(500).json({ error: "Internal Server Error" });
	}
}
