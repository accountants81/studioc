import { SidebarTrigger } from "@/components/ui/sidebar";

type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
