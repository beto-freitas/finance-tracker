import type * as React from "react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import {
	type InputAddonSlot,
	renderInputAddon,
} from "#/components/form/input-addon.tsx";
import { Input } from "#/components/ui/input.tsx";
import { InputGroup, InputGroupInput } from "#/components/ui/input-group.tsx";
import type { FieldControlProps } from "#/lib/form/field-input-wrapper.tsx";
import {
	applyBackspace,
	applyDelete,
	applyDigit,
	applyMinusToggle,
	applyPaste,
	applyStep,
	displayCaretToGap,
	editStateToValue,
	formatNumberToDisplay,
	type NumberEditOptions,
	type NumberEditResult,
	type NumberEditState,
	type NumberFormatOptions,
	resolveMinimumFractionDigits,
	resolveScale,
	resolveStep,
	valueToEditState,
} from "#/lib/form/number-display.ts";

function focusedEditorSnapshot(
	value: number | undefined,
	formatOptions: NumberFormatOptions,
): {
	state: NumberEditState;
	display: string;
	selection: { start: number; end: number };
} {
	const state = valueToEditState(value, formatOptions);
	if (state.digitString === "") {
		return { state, display: "", selection: { start: 0, end: 0 } };
	}
	const display = formatNumberToDisplay(value, formatOptions);
	const caret = display.length;
	return { state, display, selection: { start: caret, end: caret } };
}

export type NumberInputProps = FieldControlProps<number | undefined> & {
	locale?: string;
	allowNegative?: boolean;
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
	step?: number;
	leftAddon?: InputAddonSlot;
	rightAddon?: InputAddonSlot;
	placeholder?: string;
	disabled?: boolean;
};

export function NumberInput({
	id,
	value,
	onChange,
	onBlur,
	"aria-invalid": ariaInvalid,
	locale,
	allowNegative = true,
	minimumFractionDigits,
	maximumFractionDigits = 2,
	step,
	leftAddon,
	rightAddon,
	placeholder,
	disabled,
}: NumberInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const editStateRef = useRef<NumberEditState>(
		valueToEditState(undefined, { locale, maximumFractionDigits }),
	);
	const displayRef = useRef("");
	const selectionRef = useRef({ start: 0, end: 0 });
	const pendingSelectionRef = useRef<{ start: number; end: number } | null>(
		null,
	);
	const [isFocused, setIsFocused] = useState(false);
	const [display, setDisplay] = useState("");
	const [isComposing, setIsComposing] = useState(false);

	const formatOptions = useMemo<NumberFormatOptions>(
		() => ({
			locale,
			minimumFractionDigits:
				minimumFractionDigits ?? maximumFractionDigits ?? 2,
			maximumFractionDigits: maximumFractionDigits ?? 2,
		}),
		[locale, maximumFractionDigits, minimumFractionDigits],
	);

	const editOptions = useMemo<NumberEditOptions>(
		() => ({
			...formatOptions,
			allowNegative,
		}),
		[allowNegative, formatOptions],
	);

	const resolvedStep = useMemo(
		() => resolveStep(resolveScale(formatOptions), step),
		[formatOptions, step],
	);

	const syncBlurredDisplay = useCallback(() => {
		const nextDisplay = formatNumberToDisplay(value, formatOptions);
		editStateRef.current = valueToEditState(value, formatOptions);
		displayRef.current = nextDisplay;
		selectionRef.current = { start: 0, end: 0 };
		pendingSelectionRef.current = null;
		setDisplay(nextDisplay);
	}, [formatOptions, value]);

	useEffect(() => {
		if (isFocused) return;
		syncBlurredDisplay();
	}, [isFocused, syncBlurredDisplay]);

	// Reset editor when form value changes externally (reset, setFieldValue).
	useEffect(() => {
		if (!isFocused) return;

		const propState = valueToEditState(value, formatOptions);
		const editor = editStateRef.current;
		if (
			propState.digitString === editor.digitString &&
			propState.negative === editor.negative &&
			propState.scale === editor.scale
		) {
			return;
		}

		const { state, display, selection } = focusedEditorSnapshot(
			value,
			formatOptions,
		);
		editStateRef.current = state;
		displayRef.current = display;
		selectionRef.current = selection;
		pendingSelectionRef.current = selection;
		setDisplay(display);
	}, [formatOptions, isFocused, value]);

	useLayoutEffect(() => {
		const el = inputRef.current;
		const selection = pendingSelectionRef.current;
		if (!el || !isFocused || !selection) return;
		el.setSelectionRange(selection.start, selection.end);
		selectionRef.current = selection;
		pendingSelectionRef.current = null;
	});

	const commitResult = useCallback(
		(result: NumberEditResult) => {
			editStateRef.current = result.state;
			displayRef.current = result.display;
			selectionRef.current = result.selection;
			pendingSelectionRef.current = result.selection;
			setDisplay(result.display);
			onChange(result.value);
		},
		[onChange],
	);

	const getSelectionGaps = useCallback(() => {
		const el = inputRef.current;
		if (!el) return undefined;
		const sourceSelection = pendingSelectionRef.current ?? {
			start: el.selectionStart ?? selectionRef.current.start,
			end: el.selectionEnd ?? selectionRef.current.end,
		};
		const start = displayCaretToGap(
			displayRef.current,
			sourceSelection.start,
			formatOptions,
			editStateRef.current,
		);
		const end = displayCaretToGap(
			displayRef.current,
			sourceSelection.end,
			formatOptions,
			editStateRef.current,
		);
		if (start === end) return undefined;
		return { startGap: start, endGap: end };
	}, [formatOptions]);

	const handleFocus = () => {
		setIsFocused(true);
		const { state, display, selection } = focusedEditorSnapshot(
			value,
			formatOptions,
		);
		editStateRef.current = state;
		displayRef.current = display;
		selectionRef.current = selection;
		pendingSelectionRef.current = selection;
		setDisplay(display);
	};

	const handleBlur = () => {
		setIsFocused(false);
		const minFrac = resolveMinimumFractionDigits(formatOptions);
		const currentValue = editStateToValue(editStateRef.current);
		const nextDisplay = formatNumberToDisplay(currentValue, {
			...formatOptions,
			minimumFractionDigits: minFrac,
		});
		displayRef.current = nextDisplay;
		selectionRef.current = { start: 0, end: 0 };
		pendingSelectionRef.current = null;
		setDisplay(nextDisplay);
		onBlur();
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (disabled || isComposing) return;

		const el = inputRef.current;
		if (!el) return;

		const selection = getSelectionGaps();
		const sourceSelection = pendingSelectionRef.current ?? {
			start: el.selectionStart ?? selectionRef.current.start,
			end: el.selectionEnd ?? selectionRef.current.end,
		};
		const caretGap = displayCaretToGap(
			displayRef.current,
			sourceSelection.start,
			formatOptions,
			editStateRef.current,
		);

		if (event.key >= "0" && event.key <= "9") {
			event.preventDefault();
			commitResult(
				applyDigit(
					editStateRef.current,
					caretGap,
					event.key,
					editOptions,
					selection,
				),
			);
			return;
		}

		if (event.key === "Backspace") {
			event.preventDefault();
			commitResult(
				applyBackspace(editStateRef.current, caretGap, editOptions, selection),
			);
			return;
		}

		if (event.key === "Delete") {
			event.preventDefault();
			commitResult(
				applyDelete(editStateRef.current, caretGap, editOptions, selection),
			);
			return;
		}

		if (event.key === "-") {
			const atStart =
				(el.selectionStart ?? 0) === 0 && (el.selectionEnd ?? 0) === 0;
			if (!atStart && !selection) return;
			event.preventDefault();
			commitResult(applyMinusToggle(editStateRef.current, editOptions));
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			commitResult(applyStep(value, 1, { ...editOptions, step: resolvedStep }));
			return;
		}

		if (event.key === "ArrowDown") {
			event.preventDefault();
			commitResult(
				applyStep(value, -1, { ...editOptions, step: resolvedStep }),
			);
			return;
		}

		if (
			event.key === "." ||
			event.key === "," ||
			event.key === "e" ||
			event.key === "E" ||
			event.key === "+"
		) {
			event.preventDefault();
		}
	};

	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		if (disabled || isComposing) return;
		event.preventDefault();
		const text = event.clipboardData.getData("text");
		commitResult(applyPaste(editStateRef.current, text, editOptions));
	};

	const handleSelect = () => {
		const el = inputRef.current;
		if (!el) return;
		selectionRef.current = {
			start: el.selectionStart ?? 0,
			end: el.selectionEnd ?? 0,
		};
	};

	const inputProps = {
		ref: inputRef,
		id,
		type: "text" as const,
		inputMode: "decimal" as const,
		autoComplete: "off",
		disabled,
		"aria-invalid": ariaInvalid,
		placeholder,
		value: display,
		onFocus: handleFocus,
		onBlur: handleBlur,
		onChange: () => {},
		onKeyDown: handleKeyDown,
		onPaste: handlePaste,
		onSelect: handleSelect,
		onClick: handleSelect,
		onMouseUp: handleSelect,
		onCompositionStart: () => setIsComposing(true),
		onCompositionEnd: () => setIsComposing(false),
	};

	const hasAddons = leftAddon != null || rightAddon != null;

	if (!hasAddons) {
		return <Input {...inputProps} />;
	}

	return (
		<InputGroup>
			<InputGroupInput {...inputProps} />
			{renderInputAddon(leftAddon, "inline-start")}
			{renderInputAddon(rightAddon, "inline-end")}
		</InputGroup>
	);
}
