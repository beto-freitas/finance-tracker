import { z } from "zod";

export const deleteSettlementPlatformInputSchema = z.object({
	settlementPlatformId: z.uuid(),
});

export type DeleteSettlementPlatformInput = z.infer<
	typeof deleteSettlementPlatformInputSchema
>;
