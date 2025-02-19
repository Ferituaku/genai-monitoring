import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const SideButton: React.FC<{
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isCollapsed?: boolean;
}> = ({ label, href, icon, isActive, isCollapsed }) => {
  const PATHNAME = usePathname();
  const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/openai/ai-monitor";
  const NORMALIZED_HREF = href.replace(BASE_PATH, "");
  const NORMALIZED_PATHNAME = PATHNAME;
  const IS_CURRENT_PATH = NORMALIZED_PATHNAME === NORMALIZED_HREF;

  return (
    <a
      href={href}
      aria-label={label}
      className={cn(
        "flex items-center gap-4 p-2 rounded-lg",
        "transform transition-all duration-300 ease-in-out",
        "hover:bg-blue-700 group",
        IS_CURRENT_PATH || isActive ? "bg-blue-800 text-white" : "text-white",
        isCollapsed && "justify-center"
      )}
    >
      <span
        className={cn(
          "transition-transform duration-300 ease-in-out",
          "w-6 h-6 flex items-center justify-center",
          isCollapsed && "transform scale-110"
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "transition-all duration-300 ease-in-out",
          "whitespace-nowrap overflow-hidden",
          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}
      >
        {label}
      </span>{" "}
    </a>
  );
};

export default SideButton;
