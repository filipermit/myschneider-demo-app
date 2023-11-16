import { Permit } from "permitio";

const permit = new Permit({
	token:
		"permit_key_Nc5wFg2TLvyNJAoa6Kdl2CfXKc50kd4w90OgRjuqqPPEzoZJgOP5elRo3W7P7nOF8YPHNBNOdakMKbbTv0jxJK",
	pdp: "http://localhost:7766",
});

export default async function handler(req, res) {
	try {
		const { user: userId } = req.query; // Action and resource is left here for non-bulk CASL operations
		// const { action, resource } = req.body.resourcesAndActions;

		console.log(req);
		console.log("TEST: ", req.body.resourcesAndActions);

		if (!userId) {
			return res.status(400).json({ error: "No User Id" });
		}

		if (!action || !resource) {
			return res.status(400).json({ error: "Missing action or resource" });
		}

		const permittedList = [];
		req.body.resourcesAndActions.map(async (item) => {
			if (Object.keys(item.resourceAttributes).length === 0) {
				const allowed = await permit.check(userId, item.action, item.resource);
				console.log("SIMPLE CHECK: ", allowed);
				permittedList.push(allowed);
			} else {
				const resourceSet = {
					key: item.resource,
					attributes: item.resourceAttributes,
				};
				console.log("RESOURCE SET", resourceSet);
				const allowed = await permit.check(userId, item.action, resourceSet);
				console.log("ABAC CHECK: ", allowed);
				permittedList.push(allowed);
			}
		});

		console.log("PermittedList", permittedList);

		return res.status(200).send({ permittedList: permittedList });
	} catch (error) {
		return res.status(500).json({ error: "Internal Server Error" });
	}
}
