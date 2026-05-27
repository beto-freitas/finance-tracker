import { CalendarIcon } from "lucide-react";
import type * as React from "react";
import { useEffect, useId, useState } from "react";

import type { InputAddonSlot } from "#/components/form/input-addon.tsx";
import { renderInputAddon } from "#/components/form/input-addon.tsx";
import { Calendar } from "#/components/ui/calendar.tsx";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "#/components/ui/input-group.tsx";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover.tsx";
import {
	displayToIso,
	formatDisplayWhileTyping,
	formatIsoToDisplay,
	getDateDisplayMeta,
	isoToLocalDate,
	localDateToIso,
} from "#/lib/form/date-display.ts";
import type { FieldControlProps } from "#/lib/form/field-input-wrapper.tsx";

export type DateInputProps = FieldControlProps<string | undefined> & {
	placeholder?: string;
	locale?: string;
	leftAddon?: InputAddonSlot;
	disabled?: boolean;
};

export function DateInput({
	id,
	value,
	onChange,
	onBlur,
	"aria-invalid": ariaInvalid,
	placeholder,
	locale,
	leftAddon,
	disabled,
}: DateInputProps) {
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState<string | null>(null);
	const [month, setMonth] = useState<Date>(() =>
		value ? isoToLocalDate(value) : new Date(),
	);
	const calendarId = useId();

	const { placeholder: localePlaceholder } = getDateDisplayMeta(locale);
	const resolvedPlaceholder = placeholder ?? localePlaceholder;

	const shown = draft ?? formatIsoToDisplay(value, locale);

	// Sync calendar month when form value changes externally (reset, setValue, etc.).
	useEffect(() => {
		if (value) {
			setMonth(isoToLocalDate(value));
		}
	}, [value]);

	const selectedDate = value ? isoToLocalDate(value) : undefined;

	function tryCommit(display: string): boolean {
		const iso = displayToIso(display, locale);
		if (!iso) return false;
		onChange(iso);
		setDraft(formatIsoToDisplay(iso, locale));
		return true;
	}

	function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
		const nextDisplay = formatDisplayWhileTyping(event.target.value, locale);
		setDraft(nextDisplay);
		tryCommit(nextDisplay);
	}

	function handleFocus() {
		setDraft(formatIsoToDisplay(value, locale));
	}

	function handleBlur() {
		if (!tryCommit(shown)) {
			onChange(undefined);
		}
		setDraft(null);
		onBlur();
	}

	function handleCalendarSelect(date: Date | undefined) {
		if (!date) {
			setDraft(null);
			onChange(undefined);
			setOpen(false);
			return;
		}

		const iso = localDateToIso(date);
		onChange(iso);
		setDraft(null);
		setMonth(date);
		setOpen(false);
	}

	return (
		<Popover open={open} onOpenChange={setOpen} modal>
			<InputGroup>
				<InputGroupInput
					id={id}
					type="text"
					inputMode="numeric"
					autoComplete="off"
					disabled={disabled}
					aria-invalid={ariaInvalid}
					placeholder={resolvedPlaceholder}
					value={shown}
					onChange={handleInputChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
				/>
				{renderInputAddon(leftAddon, "inline-start")}
				<InputGroupAddon align="inline-end">
					<PopoverTrigger asChild disabled={disabled}>
						<InputGroupButton
							type="button"
							aria-label="Open calendar"
							aria-controls={calendarId}
							aria-expanded={open}
							onMouseDown={(event) => event.preventDefault()}
						>
							<CalendarIcon aria-hidden />
						</InputGroupButton>
					</PopoverTrigger>
				</InputGroupAddon>
			</InputGroup>
			<PopoverContent
				id={calendarId}
				className="w-auto overflow-hidden p-0"
				align="end"
				alignOffset={-8}
				sideOffset={10}
			>
				<Calendar
					mode="single"
					selected={selectedDate}
					month={month}
					onMonthChange={setMonth}
					onSelect={handleCalendarSelect}
				/>
			</PopoverContent>
		</Popover>
	);
}
