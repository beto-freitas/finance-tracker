import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import {
	type InputAddonSlot,
	renderInputAddon,
} from "#/components/form/input-addon.tsx";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
} from "#/components/ui/combobox.tsx";
import { InputGroup, InputGroupInput } from "#/components/ui/input-group.tsx";
import type { FieldControlProps } from "#/lib/form/field-input-wrapper.tsx";
import type { SelectOption } from "#/lib/form/to-select-options.ts";

export type SelectInputProps<V extends string = string> = FieldControlProps<
	V | undefined
> & {
	options: readonly SelectOption<V>[];
	placeholder?: string;
	searchable?: boolean;
	leftAddon?: InputAddonSlot;
	rightAddon?: InputAddonSlot;
	disabled?: boolean;
};

function getOptionText<V extends string>(option: SelectOption<V>): string {
	if (option.searchText) {
		return option.searchText;
	}

	if (typeof option.label === "string" && !!option.label) {
		return option.label;
	}

	return option.value;
}

export function SelectInput<V extends string>({
	value,
	onChange,
	onBlur,
	"aria-invalid": ariaInvalid,
	options,
	placeholder,
	searchable = true,
	leftAddon,
	rightAddon,
	disabled,
}: SelectInputProps<V>) {
	const [query, setQuery] = useState("");

	const resolvedPlaceholder = placeholder ?? "Select...";

	const selectedOption = useMemo(
		() => options.find((option) => option.value === value) ?? null,
		[options, value],
	);

	const filteredOptions = useMemo(() => {
		if (!searchable) return options;
		const q = query.trim().toLowerCase();
		if (!q) return options;
		return options.filter((option) =>
			getOptionText(option).toLowerCase().includes(q),
		);
	}, [options, query, searchable]);

	const resolvedRightAddon =
		rightAddon ??
		({
			variant: "icon",
			icon: ChevronDown,
		} satisfies InputAddonSlot);

	return (
		<Combobox
			items={filteredOptions}
			value={selectedOption}
			onValueChange={(next) => {
				setQuery("");

				if (next == null) {
					onChange(undefined);
					return;
				}

				const nextValue = (next as SelectOption<V>).value;
				if (nextValue === value) {
					onChange(undefined);
					return;
				}

				onChange(nextValue);
			}}
			isItemEqualToValue={(a, b) => a.value === b.value}
		>
			<InputGroup>
				<ComboboxPrimitive.Input
					render={
						<InputGroupInput
							disabled={disabled}
							aria-invalid={ariaInvalid}
							readOnly={!searchable}
						/>
					}
					placeholder={resolvedPlaceholder}
					disabled={disabled}
					onBlur={onBlur}
					onChange={(event) => {
						if (!searchable) return;
						setQuery(event.target.value);
					}}
				/>
				{renderInputAddon(leftAddon, "inline-start")}
				{renderInputAddon(resolvedRightAddon, "inline-end")}
			</InputGroup>

			<ComboboxContent>
				<ComboboxEmpty>No results.</ComboboxEmpty>
				<ComboboxList>
					{(option: SelectOption<V>) => (
						<ComboboxItem
							key={option.value}
							value={option}
							disabled={option.disabled}
						>
							{option.label}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
