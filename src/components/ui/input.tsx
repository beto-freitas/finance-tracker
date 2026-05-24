import type * as React from "react";

import {
	controlInnerVariants,
	controlShellVariants,
} from "#/components/form/control-variants.ts";
import { cn } from "#/lib/utils.ts";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(controlShellVariants(), controlInnerVariants(), className)}
			{...props}
		/>
	);
}

export { Input };
