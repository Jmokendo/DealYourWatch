import { cn } from "@/lib/utils";
import type { Condition } from "@/lib/api/contracts";

interface ConditionSectionProps {
  conditions: Array<{ value: Condition; label: string; hint: string }>;
  selectedCondition: Condition;
  onConditionChange: (value: Condition) => void;
  hasBox: boolean;
  hasPapers: boolean;
  onHasBoxChange: (value: boolean) => void;
  onHasPapersChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ConditionSection({
  conditions,
  selectedCondition,
  onConditionChange,
  hasBox,
  hasPapers,
  onHasBoxChange,
  onHasPapersChange,
  disabled = false,
}: ConditionSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {conditions.map((item) => (
          <button
            key={item.value}
            type="button"
            disabled={disabled}
            onClick={() => onConditionChange(item.value)}
            className={cn(
              "rounded-[18px] border px-4 py-4 text-left transition",
              selectedCondition === item.value
                ? "border-[#1d1d21] bg-[#1d1d21] text-white"
                : "border-[#e1ddd7] bg-white text-[#25252a] hover:border-[#c9c4bb]",
            )}
          >
            <p className="text-sm font-semibold">{item.label}</p>
            <p className={cn(
              "mt-1 text-xs",
              selectedCondition === item.value ? "text-white/70" : "text-[#8b867f]",
            )}>
              {item.hint}
            </p>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-[16px] border border-[#e1ddd7] bg-white px-4 py-4 text-sm text-[#302f35]">
          <input
            type="checkbox"
            checked={hasBox}
            onChange={(event) => onHasBoxChange(event.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Caja original
        </label>

        <label className="flex items-center gap-3 rounded-[16px] border border-[#e1ddd7] bg-white px-4 py-4 text-sm text-[#302f35]">
          <input
            type="checkbox"
            checked={hasPapers}
            onChange={(event) => onHasPapersChange(event.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Papeles / garantia
        </label>
      </div>
    </div>
  );
}
