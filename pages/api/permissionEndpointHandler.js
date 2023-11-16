// This should be a middleware that gets evaluated per useSet

export default async (req, res) => {
	try {
		// Get the object from the request body
		const { show, apiendpoint, ail, verifybyapistatus, apiresponsemapping } =
			req.body;

		// If "show" is false, do nothing and return
		if (!show) {
			return res.status(200).json({ message: "Show is false, doing nothing." });
		}

		if (apiendpoint) {
			const response = await fetch(apiendpoint);
			const data = await response.json();

			// If "verifybyapistatus" is true, only validate based on the status response
			if (verifybyapistatus) {
				if (response.ok) {
					return res
						.status(200)
						.json({
							message:
								"API returned a successful status - the user is authorized",
						});
				} else {
					return res
						.status(400)
						.json({
							message:
								"API returned an error status - the user is blocked from this",
						});
				}
			} else {
				// Handle custom logic if verifybyapistatus is false
				if (!apiresponsemapping) {
					return res
						.status(400)
						.json({ message: "API response mapping not provided." });
				}
				// Filter the fetched data based on the mapping
				const filteredData = data.filter((item) =>
					apiresponsemapping.includes(item.key)
				);

				// TODO: Handle this data as user or resource attributes

				return res.status(200).json(filteredData);
			}
		} else if (ail && Array.isArray(ail)) {
			// Check if ail is an array
			for (const value of ail) {
				// TODO: Do something with each value
				// Set them as an attribute or condition?
			}
			return res.status(200).json({ message: "Processed ail values." });
		} else {
			return res.status(400).json({ message: "No matching values." });
		}
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Internal Server Error", error: error.message });
	}
};
