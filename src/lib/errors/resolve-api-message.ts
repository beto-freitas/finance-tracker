export function resolveApiMessage(envelope: unknown): string | undefined {
	console.log("resolveApiMessage", envelope);
	if (!envelope) {
		return;
	}

	if (envelope instanceof Error) {
		if (!envelope.message) {
			return;
		}

		return envelope.message;
	}

	if (typeof envelope === "string") {
		return envelope;
	}

	if (typeof envelope === "object" && "message" in envelope) {
		if (!envelope.message) {
			return;
		}

		return String(envelope.message);
	}

	return JSON.stringify(envelope, null, 2);
}
