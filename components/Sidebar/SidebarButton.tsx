import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const SideButton: React.FC<{
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}> = ({ label, href, icon, isActive }) => {
  const pathname = usePathname();
  const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/openai/ai-monitor";
  const normalizedHref = href.replace(BASE_PATH, "");
  const normalizedPathname = pathname;

  const isCurrentPath = normalizedPathname === normalizedHref;

  return (
    <a
      href={href}
      aria-label={label}
      className={cn(
        "flex items-center gap-4 p-2 rounded-lg transition-colors duration-300",
        isCurrentPath || isActive
          ? "bg-blue-800 text-white"
          : "text-white hover:bg-blue-800 hover:text-white"
      )}
    >
      <span className="w-6 h-6">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </a>
  );
};

export default SideButton;
