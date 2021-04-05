jest.mock('edgegrid');

const EdgeGrid = require('edgegrid');
const { purgeCpCodes } = require('../src/akamai-purge');

describe('Akamai Purge', () => {
	beforeEach(() => {
		// Mock things like fs, or netstorage...
		jest.restoreAllMocks();
	});

	test('Clear CP Code with Good Response', async () => {
		const response = `{"httpStatus":201,"detail":"Request accepted","supportId":"edcp-4VXDjecr1rQ9KEBUxj2rS4","purgeId":"edcp-4VXDjecr1rQ9KEBUxj2rS4","estimatedSeconds":5}`;
		const actual = {
			httpStatus: 201,
			detail: 'Request accepted',
			supportId: 'edcp-4VXDjecr1rQ9KEBUxj2rS4',
			purgeId: 'edcp-4VXDjecr1rQ9KEBUxj2rS4',
			estimatedSeconds: 5,
		};

		const authSpy = jest
			.spyOn(EdgeGrid.prototype, 'auth')
			.mockImplementation(() => {});

		const sendSpy = jest
			.spyOn(EdgeGrid.prototype, 'send')
			.mockImplementation((callback) => {
				callback(null, { statusCode: 201 }, response);
			});

		const actualInfo = await purgeCpCodes(
			'host',
			'clientToken',
			'clientSecret',
			'accessToken',
			[12345]
		);

		expect(actualInfo).toEqual(actual);
		expect(EdgeGrid).toHaveBeenCalledWith(
			'clientToken',
			'clientSecret',
			'accessToken',
			'host'
		);
		expect(authSpy).toHaveBeenCalledWith({
			path: '/ccu/v3/delete/cpcode/production',
			method: 'POST',
			body: {
				objects: [12345],
			},
		});
		expect(sendSpy).toHaveBeenCalledWith(expect.any(Function));
	});

	test('Clear CP Code with Bad Response', async () => {
		const badRes = JSON.stringify({
			httpStatus: 400,
			detail: '8697766',
			supportId: 'edcp-PBfEj6C9bFB7C53ix6cMdN',
			title: 'bad cpcode',
			describedBy:
				'https://developer.akamai.com/api/core_features/fast_purge/v3.html#httpcodes',
		});

		const authSpy = jest
			.spyOn(EdgeGrid.prototype, 'auth')
			.mockImplementation(() => {});

		const sendSpy = jest
			.spyOn(EdgeGrid.prototype, 'send')
			.mockImplementation((callback) => {
				callback(
					null,
					{ statusCode: 400, statusMessage: 'Bad Request' },
					badRes
				);
			});

		await expect(
			purgeCpCodes('host', 'clientToken', 'clientSecret', 'accessToken', [
				12345,
			])
		).rejects.toThrow(
			'Failed to clear with status 400. Reason: "Bad Request".'
		);

		expect(EdgeGrid).toHaveBeenCalledWith(
			'clientToken',
			'clientSecret',
			'accessToken',
			'host'
		);
		expect(authSpy).toHaveBeenCalledWith({
			path: '/ccu/v3/delete/cpcode/production',
			method: 'POST',
			body: {
				objects: [12345],
			},
		});
		expect(sendSpy).toHaveBeenCalledWith(expect.any(Function));
	});

	test('Clear CP Code with Exception', async () => {
		const authSpy = jest
			.spyOn(EdgeGrid.prototype, 'auth')
			.mockImplementation(() => {});

		const sendSpy = jest
			.spyOn(EdgeGrid.prototype, 'send')
			.mockImplementation((callback) => {
				callback(new Error('I am the error'), null, null);
			});

		await expect(
			purgeCpCodes('host', 'clientToken', 'clientSecret', 'accessToken', [
				12345,
			])
		).rejects.toThrow('I am the error');

		expect(EdgeGrid).toHaveBeenCalledWith(
			'clientToken',
			'clientSecret',
			'accessToken',
			'host'
		);
		expect(authSpy).toHaveBeenCalledWith({
			path: '/ccu/v3/delete/cpcode/production',
			method: 'POST',
			body: {
				objects: [12345],
			},
		});
		expect(sendSpy).toHaveBeenCalledWith(expect.any(Function));
	});
});
