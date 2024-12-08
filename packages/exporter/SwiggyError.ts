class SwiggyError extends Error {
	statusCode: number;
	reason?: string;

	constructor(message: string, statusCode: number, reason?: string) {
		super(message);
		this.name = 'SwiggyError';
		this.statusCode = statusCode;
		this.reason = reason;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, SwiggyError);
		}
	}
}

export default SwiggyError;
