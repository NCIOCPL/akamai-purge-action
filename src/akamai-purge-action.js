const core = require('@actions/core');
const { purgeCpCodes } = require('./akamai-purge');

/**
 * This makes sure that all the cp codes are numbers and
 * will also make sure that an array of ints are returned.
 *
 * NOTE: Github Action Vars are Always Strings
 *
 * @param {string} codes A cp-code, or a comma-separated list of cp-codes
 *
 * @throws if any of the cp-codes are not integers an error will be thrown.
 */
const validateAndCleanCPCodes = (codes) => {
	const parsedCodes = codes.split(',').map((c) => Number.parseInt(c.trim()));
	if (parsedCodes.some((code) => Number.isNaN(code))) {
		throw new Error(`CP Codes Must be Numbers.`);
	}
	return parsedCodes;
};

/**
 * Run the Action.
 */
async function run() {
	try {
		// Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
		const hostname = core.getInput('hostname', { required: true });
		const clientSecret = core.getInput('client-secret', { required: true });
		const accessToken = core.getInput('access-token', { required: true });
		const clientToken = core.getInput('client-token', { required: true });
		const type = core.getInput('type', { required: true });
		const ref = core.getInput('ref', { required: true });

		switch (type) {
			case 'cpcodes': {
				const cacheInfo = await purgeCpCodes(
					hostname,
					clientToken,
					clientSecret,
					accessToken,
					validateAndCleanCPCodes(ref)
				);
				// Output cacheInfo.
				core.info(
					`Cache Cleared Successfully with purgeId, ${cacheInfo.purgeId} and support id, ${cacheInfo.supportId}.`
				);
				break;
			}
			default: {
				throw new Error(`Type, ${type}, is unknown.`);
			}
		}
	} catch (error) {
		core.setFailed(error.message);
	}
}

module.exports = run;
