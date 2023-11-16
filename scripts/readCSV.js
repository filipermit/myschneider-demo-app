const Papa = require("papaparse");
const fs = require("fs");

const file = "data/sample-data-schneider.csv";
const outputFile = "output.json";
const rowsOutputFile = "output_rows.json";
const columnsOutputFile = "output_columns.json";
const apiResponseMappingsFile = "api_response_mappings.json";

fs.readFile(file, "utf8", function (err, csvString) {
	if (err) {
		console.error("Failed to read file", err);
		return;
	}

	Papa.parse(csvString, {
		complete: function (results) {
			const data = results.data;
			const transformedData = [];
			const rowsData = [];
			const columnsData = [];
			const apiResponseMappings = [];
			const seenMappings = new Set();

			// Start from the 5th row and iterate over each row
			for (let i = 4; i < data.length; i++) {
				// Iterate over each column starting from the 6th one
				for (let j = 5; j < data[i].length; j++) {
					const serviceNameString = data[3][j];
					const serviceName = serviceNameString.includes('"name":"')
						? serviceNameString.split('"name":"')[1].replace('"', "")
						: serviceNameString;

					const cellData = {
						user_set: {
							country_code: data[i][1], // Data from column 2 of the same row
							country: data[i][2], // Data from column 3 of the same row
							customer_classification_level_1_code: data[i][3], // Data from column 4 of the same row
							customer_classification_level_1: data[i][4], // Data from column 5 of the same row
						},
						resource_set: {
							resource_name: data[0][j],
							service_mapping_condition: data[1][j],
							service_name: serviceName,
							cell_value: parseCellValue(data[i][j]), // Parsed data from the current cell
						},
					};
					transformedData.push(cellData);

					// Extract and check for unique apiresponsemappings
					const cellValueApiResponseMappings =
						cellData.resource_set.cell_value.apiresponsemapping;
					if (cellValueApiResponseMappings) {
						// Convert the mapping to a string for comparison
						const mappingString = JSON.stringify(cellValueApiResponseMappings);
						if (!seenMappings.has(mappingString)) {
							apiResponseMappings.push(cellValueApiResponseMappings);
							seenMappings.add(mappingString); // Mark this mapping as seen
						}
					}
				}
			}

			for (let i = 4; i < data.length; i++) {
				rowsData.push({
					country_code: data[i][1],
					country: data[i][2],
					customer_classification_level_1_code: data[i][3],
					customer_classification_level_1: data[i][4],
				});
			}

			for (let index = 5; index < data[0].length; index++) {
				const columnObject = {
					resource_name: data[0][index],
					service_name: data[3][index].includes('"name":"')
						? data[3][index].split('"name":"')[1].replace('"', "")
						: data[3][index],
				};
				columnsData.push(columnObject);
			}

			// Write the original transformed data to a JSON file
			fs.writeFile(
				outputFile,
				JSON.stringify(transformedData, null, 2),
				handleError
			);

			// Write the rows data to a JSON file
			fs.writeFile(
				rowsOutputFile,
				JSON.stringify(rowsData, null, 2),
				handleError
			);

			// Write the columns data to a JSON file
			fs.writeFile(
				columnsOutputFile,
				JSON.stringify(columnsData, null, 2),
				handleError
			);

			// Write the apiresponsemappings data to a JSON file
			fs.writeFile(
				apiResponseMappingsFile,
				JSON.stringify(apiResponseMappings, null, 2),
				handleError
			);
		},
	});
});

function handleError(err) {
	if (err) {
		console.error("Error writing JSON to file", err);
	}
}

function parseCellValue(cellValueString) {
	// Remove leading and trailing quotes, then split by ","
	const keyValuePairs = cellValueString.replace(/^\"|\"$/g, "").split(",");

	const result = {};
	keyValuePairs.forEach((pair) => {
		// Split by the first occurrence of ":" to separate key and value
		let [key, value] = pair.split(/:(.+)/);

		if (value === undefined) {
			// Handle the case where ":" is missing or is the last character
			value = "";
		}

		key = key.trim().replace(/^\"|\"$/g, ""); // Remove extra quotes from key

		// Check if value is an array or boolean or string
		if (value.trim().startsWith("[")) {
			value = value
				.trim()
				.replace(/^\[|\]$/g, "")
				.split(",")
				.map((v) => v.trim().replace(/^\"|\"$/g, ""));
		} else if (value.trim() === "false" || value.trim() === "true") {
			value = value.trim() === "true";
		} else {
			value = value.trim().replace(/^\"|\"$/g, "");
		}

		result[key] = value;
	});

	return result;
}
