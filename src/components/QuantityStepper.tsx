import { Button } from "@/components/ui/button";

type Props = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number | undefined; // undefined => no cap
  className?: string;
};

export default function QuantityStepper({ value, onChange, min = 1, max, className }: Props) {
  const decDisabled = value <= min;
  const incDisabled = max !== undefined && value >= max;

  return (
    <div className={`flex items-center border rounded-lg overflow-hidden ${className || ""}`}>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-none h-9 w-9"
        disabled={decDisabled}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
      >
        −
      </Button>

      <input
        type="number"
        className="w-14 text-center outline-none h-9"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value) || min;
          const clamped = Math.max(min, max === undefined ? n : Math.min(n, max));
          onChange(clamped);
        }}
      />

      <Button
        variant="ghost"
        size="icon"
        className="rounded-none h-9 w-9"
        disabled={incDisabled}
        onClick={() => {
          const n = value + 1;
          onChange(max === undefined ? n : Math.min(n, max));
        }}
        aria-label="Increase quantity"
      >
        +
      </Button>
    </div>
  );
}
