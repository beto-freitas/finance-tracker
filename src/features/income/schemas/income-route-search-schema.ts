import { z } from "zod";

const uuidParam = z.uuid();

/** Parsed from `/app/income` search; drives overlay hosts in later phases. */
export const incomeRouteSearchSchema = z.object({
	// TODO: superRefine mutually exclusive search params (e.g. create + edit income source)
	manage: z.enum(["income-sources", "settlement-platforms"]).optional(),
	"create-income-source": z.literal("true").optional(),
	"edit-income-source-id": uuidParam.optional(),
	"end-income-source-id": uuidParam.optional(),
	"delete-income-source-id": uuidParam.optional(),
	"create-settlement-platform": z.literal("true").optional(),
	"edit-settlement-platform-id": uuidParam.optional(),
	"delete-settlement-platform-id": uuidParam.optional(),
	"create-one-off": z.literal("true").optional(),
	"receive-income-receipt-id": uuidParam.optional(),
	"override-income-receipt-id": uuidParam.optional(),
	"cancel-income-receipt-id": uuidParam.optional(),
	"delete-one-off-id": uuidParam.optional(),
});

export type IncomeRouteSearch = z.infer<typeof incomeRouteSearchSchema>;
