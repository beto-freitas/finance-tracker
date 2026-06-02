import { Link } from "@tanstack/react-router";
import { Pencil, Trash2Icon } from "lucide-react";
import { Button } from "#/components/ui/button";
import type { SettlementPlatformListItem } from "#/features/settlement-platforms/queries/settlement-platform-list-query-options";
import {
	formatAssumedBaseRateMajor,
	formatEffectiveRateMajor,
	formatSpreadPercentMajor,
} from "#/lib/currency/format-rate";
import {
	openSettlementPlatformDelete,
	openSettlementPlatformEdit,
} from "./income-search";

type SettlementPlatformCardProps = {
	platform: SettlementPlatformListItem;
};

export function SettlementPlatformCard({
	platform,
}: SettlementPlatformCardProps) {
	return (
		<li className="flex flex-col gap-2 rounded-lg border border-border p-3">
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0 flex-1">
					<p className="font-medium">{platform.name}</p>
					<p className="text-xs text-muted-foreground">
						{platform.incomeCurrency}
					</p>
				</div>
				<div className="flex shrink-0 gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label={`Edit ${platform.name}`}
						asChild
					>
						<Link
							to="/app/income"
							search={(prev) => openSettlementPlatformEdit(prev, platform.id)}
						>
							<Pencil className="size-4" />
						</Link>
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label={`Delete ${platform.name}`}
						asChild
					>
						<Link
							to="/app/income"
							search={(prev) => openSettlementPlatformDelete(prev, platform.id)}
						>
							<Trash2Icon className="size-4" />
						</Link>
					</Button>
				</div>
			</div>

			<p className="text-sm tabular-nums text-muted-foreground">
				Spread {formatSpreadPercentMajor(platform.exchangeSpreadPercentMajor)} ·
				Base {formatAssumedBaseRateMajor(platform.assumedBaseRateMajor)} ·
				Effective {formatEffectiveRateMajor(platform.effectiveRateMajor)}
			</p>
		</li>
	);
}
