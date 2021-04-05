jest.mock('@actions/core');
jest.mock('../src/akamai-purge.js');

const core = require('@actions/core');
const AkamaiPurge = require('../src/akamai-purge');
const run = require('../src/akamai-purge-action');

const GOOD_RESPONSE = {
	httpStatus: 201,
	detail: 'Request accepted',
	supportId: 'edcp-7rgbiDspz3DCBrZzCeyrzt',
	purgeId: 'edcp-7rgbiDspz3DCBrZzCeyrzt',
	estimatedSeconds: 5,
};

/* eslint-disable no-undef */
describe('Purge Akamai', () => {
	beforeEach(() => {
		// Mock things like fs, or netstorage...
		jest.restoreAllMocks();
	});

	/*----------- Parsing --------------*/
	test('Handles single cpcode as string', async () => {
		core.getInput = jest
			.fn()
			.mockReturnValueOnce('hostname')
			.mockReturnValueOnce('client-secret')
			.mockReturnValueOnce('access-token')
			.mockReturnValueOnce('client-token')
			.mockReturnValueOnce('cpcodes') // type
			.mockReturnValueOnce('12345');

		core.setFailed = jest.fn();

		core.info = jest.fn();

		const spy = jest
			.spyOn(AkamaiPurge, 'purgeCpCodes')
			.mockImplementation(() => {
				return GOOD_RESPONSE;
			});

		await run();

		expect(core.setFailed).not.toHaveBeenCalled();
		expect(spy).toHaveBeenCalledWith(
			'hostname',
			'client-token',
			'client-secret',
			'access-token',
			[12345]
		);
		expect(core.info).toHaveBeenCalledWith(
			'Cache Cleared Successfully with purgeId, edcp-7rgbiDspz3DCBrZzCeyrzt and support id, edcp-7rgbiDspz3DCBrZzCeyrzt.'
		);
		spy.mockRestore();
	});

	test('Handles cpcodes as comma-separated string', async () => {
		core.getInput = jest
			.fn()
			.mockReturnValueOnce('hostname')
			.mockReturnValueOnce('client-secret')
			.mockReturnValueOnce('access-token')
			.mockReturnValueOnce('client-token')
			.mockReturnValueOnce('cpcodes') // type
			.mockReturnValueOnce('12345,56789');

		core.setFailed = jest.fn();
		core.info = jest.fn();

		const spy = jest
			.spyOn(AkamaiPurge, 'purgeCpCodes')
			.mockImplementation(() => {
				return GOOD_RESPONSE;
			});

		await run();

		expect(core.setFailed).not.toHaveBeenCalled();
		expect(spy).toHaveBeenCalledWith(
			'hostname',
			'client-token',
			'client-secret',
			'access-token',
			[12345, 56789]
		);
		expect(core.info).toHaveBeenCalledWith(
			'Cache Cleared Successfully with purgeId, edcp-7rgbiDspz3DCBrZzCeyrzt and support id, edcp-7rgbiDspz3DCBrZzCeyrzt.'
		);
		spy.mockRestore();
	});

	test('Handles cpcodes with comma-separated string incl spaces', async () => {
		core.getInput = jest
			.fn()
			.mockReturnValueOnce('hostname')
			.mockReturnValueOnce('client-secret')
			.mockReturnValueOnce('access-token')
			.mockReturnValueOnce('client-token')
			.mockReturnValueOnce('cpcodes') // type
			.mockReturnValueOnce('12345, 56789 ');

		core.setFailed = jest.fn();
		core.info = jest.fn();

		const spy = jest
			.spyOn(AkamaiPurge, 'purgeCpCodes')
			.mockImplementation(() => {
				return GOOD_RESPONSE;
			});

		await run();

		expect(core.setFailed).not.toHaveBeenCalled();
		expect(spy).toHaveBeenCalledWith(
			'hostname',
			'client-token',
			'client-secret',
			'access-token',
			[12345, 56789]
		);
		expect(core.info).toHaveBeenCalledWith(
			'Cache Cleared Successfully with purgeId, edcp-7rgbiDspz3DCBrZzCeyrzt and support id, edcp-7rgbiDspz3DCBrZzCeyrzt.'
		);
		spy.mockRestore();
	});

	/*==========================================*/
	/*----------- Error Conditions -------------*/
	/*==========================================*/
	test('Handles unknown type', async () => {
		core.getInput = jest
			.fn()
			.mockReturnValueOnce('hostname')
			.mockReturnValueOnce('client-secret')
			.mockReturnValueOnce('access-token')
			.mockReturnValueOnce('client-token')
			.mockReturnValueOnce('chicken') // type
			.mockReturnValueOnce(12345);

		core.setFailed = jest.fn();

		const spy = jest
			.spyOn(AkamaiPurge, 'purgeCpCodes')
			.mockImplementation(() => {});

		await run();

		expect(core.setFailed).toHaveBeenCalledWith('Type, chicken, is unknown.');
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	test('Errors when single cpcode is not an int', async () => {
		core.getInput = jest
			.fn()
			.mockReturnValueOnce('hostname')
			.mockReturnValueOnce('client-secret')
			.mockReturnValueOnce('access-token')
			.mockReturnValueOnce('client-token')
			.mockReturnValueOnce('cpcodes') // type
			.mockReturnValueOnce('chicken');

		core.setFailed = jest.fn();

		const spy = jest
			.spyOn(AkamaiPurge, 'purgeCpCodes')
			.mockImplementation(() => {});

		await run();

		expect(core.setFailed).toHaveBeenCalledWith('CP Codes Must be Numbers.');
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	test('Errors when a cpcode is not an int in a list', async () => {
		core.getInput = jest
			.fn()
			.mockReturnValueOnce('hostname')
			.mockReturnValueOnce('client-secret')
			.mockReturnValueOnce('access-token')
			.mockReturnValueOnce('client-token')
			.mockReturnValueOnce('cpcodes') // type
			.mockReturnValueOnce('12345,chicken');

		core.setFailed = jest.fn();

		const spy = jest
			.spyOn(AkamaiPurge, 'purgeCpCodes')
			.mockImplementation(() => {});

		await run();

		expect(core.setFailed).toHaveBeenCalledWith('CP Codes Must be Numbers.');
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	test('Invalid CP Code Errors', async () => {
		core.getInput = jest
			.fn()
			.mockReturnValueOnce('hostname')
			.mockReturnValueOnce('client-secret')
			.mockReturnValueOnce('access-token')
			.mockReturnValueOnce('client-token')
			.mockReturnValueOnce('cpcodes') // type
			.mockReturnValueOnce('12345');

		core.setFailed = jest.fn();

		core.info = jest.fn();

		const spy = jest
			.spyOn(AkamaiPurge, 'purgeCpCodes')
			.mockImplementation(() => {
				throw new Error(
					'Failed to clear with status 400. Reason: "bad cpcode".'
				);
			});

		await run();

		expect(core.setFailed).toHaveBeenCalledWith(
			'Failed to clear with status 400. Reason: "bad cpcode".'
		);
		expect(spy).toHaveBeenCalledWith(
			'hostname',
			'client-token',
			'client-secret',
			'access-token',
			[12345]
		);
		expect(core.info).not.toHaveBeenCalled();
		spy.mockRestore();
	});
});
