const Permit = require("permitio");
const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs").promises;

dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

PROJECT_ID = process.env.PERMIT_PROJECT_ID;
ENV_ID = process.env.PERMIT_ENV_ID;
ENV_NAME = process.env.PERMIT_ENV_NAME;
API_ROUTE = "https://api.permit.io/v2";

const getHeaders = () => {
	return {
		"Content-Type": "application/json",
		Authorization: `Bearer ${process.env.PERMIT_ORG_KEY}`,
	};
};

const handleError = (error, functionName) => {
	console.error(`Error in ${functionName}:`, error);
	throw error;
};

const createEnvironment = async (projId) => {
	try {
		const response = await axios.post(
			`${API_ROUTE}/projects/${projId}/envs`,
			{ key: ENV_ID, name: ENV_NAME },
			{ headers: getHeaders() }
		);
		return response.data;
	} catch (error) {
		handleError(error, "createEnvironment");
	}
};

const createRole = async (proj_id, env_id) => {
	try {
		const response = await axios.post(
			`${API_ROUTE}/schema/${proj_id}/${env_id}/roles`,
			{ key: "viewer", name: "Viewer" },
			{ headers: getHeaders() }
		);
		return response.data;
	} catch (error) {
		handleError(error, "createRole");
	}
};

const createUserAttributes = async (proj_id, env_id, attributesArray) => {
	try {
		const responses = await Promise.all(
			attributesArray.map((attribute) => {
				return axios.post(
					`${API_ROUTE}/schema/${proj_id}/${env_id}/users/attributes`,
					{ key: attribute, type: "string" },
					{ headers: getHeaders() }
				);
			})
		);

		return responses.map((response) => response.data);
	} catch (error) {
		handleError(error, "createUserAttributes");
	}
};

const createResource = async (proj_id, env_id) => {
	try {
		const response = await axios.post(
			`${API_ROUTE}/schema/${proj_id}/${env_id}/resources`,
			{
				key: "service",
				name: "Service",
				actions: {
					view: {},
				},
				attributes: {
					show: { type: "bool" },
					ail: { type: "array" },
					apiendpoint: { type: "string" },
					provider: { type: "string" },
					verifybyapistatus: { type: "bool" },
					apiresponsemapping: { type: "string" },
				},
			},
			{ headers: getHeaders() }
		);
		return response.data;
	} catch (error) {
		handleError(error, "createResource");
	}
};

const createUserSet = async (proj_id, env_id, object) => {
	const key = `${object.country_code}-${object.customer_classification_level_1_code}`;

	try {
		const response = await axios.post(
			`${API_ROUTE}/schema/${proj_id}/${env_id}/condition_sets`,
			{
				key,
				name: `${key} Viewer`,
				type: "userset",
				conditions: {
					allOf: [
						{
							allOf: [
								{ "user.roles": { equals: "viewer" } },
								{ "user.country": { equals: object.country_code } },
								{
									"user.channel": {
										equals: object.customer_classification_level_1_code,
									},
								},
							],
						},
					],
				},
			},
			{ headers: getHeaders() }
		);

		return response.data;
	} catch (error) {
		handleError(error, "createUserSet", "DUPLICATE_ENTITY");
	}
};

const createResourceInstances = async (proj_id, env_id, object) => {
	const cellValues = object.resource_set.cell_value; // Assuming this is the correct variable name

	// Dynamically construct the attributes object
	const attributes = {};
	if (cellValues) {
		for (const key in cellValues) {
			if (cellValues.hasOwnProperty(key)) {
				attributes[key] = cellValues[key];
			}
		}
	}

	try {
		const response = await axios.post(
			`${API_ROUTE}/facts/${proj_id}/${env_id}/resource_instances`,
			{
				key: `${object.user_set.country_code}-${object.user_set.customer_classification_level_1_code}-${object.resource_set.service_name}`,
				resource: "service",
				tenant: "default",
				attributes: attributes,
			},
			{ headers: getHeaders() }
		);

		return response.data;
	} catch (error) {
		handleError(error, "createResourceSet");
	}
};

async function loopOverResourceInstances(filePath) {
	try {
		const fileContent = await fs.readFile(filePath, "utf8");
		const objects = JSON.parse(fileContent);

		for (const object of objects) {
			await createResourceInstances(PROJECT_ID, ENV_ID, object);
		}
	} catch (error) {
		console.error("Error:", error);
	}
}

async function loopOverUserSets(filePath) {
	try {
		const fileContent = await fs.readFile(filePath, "utf8");
		const objects = JSON.parse(fileContent);

		for (const object of objects) {
			await createUserSet(PROJECT_ID, ENV_ID, object);
		}
	} catch (error) {
		console.error("Error:", error);
	}
}

async function main() {
	try {
		await createEnvironment(PROJECT_ID);
		await createRole(PROJECT_ID, ENV_ID);
		await createUserAttributes(PROJECT_ID, ENV_ID, ["country", "channel"]);
		await createResource(PROJECT_ID, ENV_ID);
		await loopOverUserSets("output_rows.json");
		await loopOverResourceInstances("output.json");
	} catch (error) {
		console.error("Error in main flow:", error);
	}
}

main();
