import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function TimeFlowLogo({ className }: { className?: string }) {
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const appName = lang === 'ar' ? "MomentumFlow" : "MomentumFlow";

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
                d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16 9V16H22"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            </svg>
        <span className="text-xl font-semibold text-sidebar-foreground">{appName}</span>
    </div>

  );
}
