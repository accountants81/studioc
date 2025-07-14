import { cn } from "@/lib/utils";

export function MomentumFlowLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
        <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
            >
            <path
                d="M6 26V9.5L12.5 18L19 9.5V26"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M26 13V6H19"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            </svg>
        <span className="text-xl font-semibold text-foreground">MomentumFlow</span>
    </div>

  );
}
