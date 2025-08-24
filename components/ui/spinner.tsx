import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: number;
  className?: string;
  variant?: "default" | "button";
}

export function Spinner({
  size = 24,
  className,
  variant = "default"
}: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cn(
        "animate-spin",
        {
          "text-orange-600": variant === "default",
          "text-orange-50": variant === "button",
        },
        className
      )}
    />
  );
}

interface SpinnerButtonProps extends SpinnerProps {
  text?: string;
}

export function SpinnerButton({ 
  size = 16, 
  text,
  className 
}: SpinnerButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <Spinner size={size} variant="button" className={className} />
      {text && <span className="text-sm text-orange-50">{text}</span>}
    </div>
  );
}
