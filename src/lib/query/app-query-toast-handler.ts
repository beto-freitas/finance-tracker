import { toast } from "sonner";
import { resolveApiMessage } from "../errors/resolve-api-message";

export function appQueryToastHandler(
	envelope?: unknown,
	type: "success" | "error" = "success",
) {
	const message = resolveApiMessage(envelope);
	if (!message) {
		return;
	}

	toast[type](message);
}
