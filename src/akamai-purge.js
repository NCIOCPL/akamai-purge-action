const EdgeGrid = require('edgegrid');

/**
 * This makes the actual request.
 *
 * @param {EdgeGrid} client The EG client
 */
const sendRequest = async (client) => {
	return new Promise((resolve, reject) => {
		client.send((err, res, body) => {
			if (err) {
				return reject(err);
			} else {
				if (res.statusCode === 201) {
					return resolve(JSON.parse(body));
				} else {
					// NOTE: There is an error condition where we will get back a JSON body with a better
					// message than the server's statusMessage.  HOWEVER, there are also conditions
					// where the EdgeGrid module will make a request, get a 404 as in page not found
					// and set the body to an HTML document.
					// So we are just going to use the statusMessage. TBH, Akamai should fix thier API to
					// respond with the correct status message.
					return reject(
						new Error(
							`Failed to clear with status ${res.statusCode}. Reason: "${res.statusMessage}".`
						)
					);
				}
			}
		});
	});
};

/**
 * Purges a CP Code
 *
 * @param {string} host the Akamai API hostname
 * @param {string} clientToken the client token for the API
 * @param {string} clientSecret the client secret for the API
 * @param {string} accessToken the access token for the API
 * @param {Array<int>} cpCode the CP code to clear
 */
const purgeCpCodes = async (
	host,
	clientToken,
	clientSecret,
	accessToken,
	cpCodes
) => {
	const client = new EdgeGrid(clientToken, clientSecret, accessToken, host);

	// This creates a request, adding in an auth header, so it does
	// not realy do the authentication, but sets up the request.
	// Infact, see the following from their docs:
	// "NOTE: Requests to the API are signed with a timestamp and therefore should be executed immediately."
	client.auth({
		path: '/ccu/v3/delete/cpcode/production',
		method: 'POST',
		body: {
			objects: cpCodes,
		},
	});

	const info = await sendRequest(client);

	return info;
};

module.exports = {
	purgeCpCodes,
};
