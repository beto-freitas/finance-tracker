/**
 * Form state for {@link NumberInput} and {@link CurrencyInput}: empty fields are `undefined`, including
 * when the Zod schema uses required `z.number()` (validated on submit).
 *
 * Use for `defaultValues` hooks (`satisfies` + `as`). Keep `z.infer` for
 * validated submit payloads.
 */
export type FormValuesWithEmptyNumbers<T extends Record<string, unknown>> = {
	[K in keyof T]: [T[K]] extends [number] ? number | undefined : T[K];
};
