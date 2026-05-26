import type * as React from "react";

export type SelectOption<V extends string = string> = {
	value: V;
	label: React.ReactNode;
	searchText?: string;
	disabled?: boolean;
};

export function toSelectOptions<const T extends readonly string[]>(
	tuple: T,
	labels?: Partial<Record<T[number], string>>,
): SelectOption<T[number]>[] {
	return tuple.map((value: T[number]) => {
		const label = labels?.[value];
		return {
			value,
			label: label ?? value,
			searchText: label,
		};
	});
}
