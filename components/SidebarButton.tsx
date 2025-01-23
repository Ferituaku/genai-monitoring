const SideButton: React.FC<{
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}> = ({ label, href, icon, isActive }) => {
  return (
    <a
      href={href}
      aria-label={label}
      className={`flex items-center gap-4 p-2 rounded-lg transition-colors duration-300 ${
        isActive
          ? "bg-blue-800 text-white"
          : "text-white hover:bg-blue-800 hover:text-white"
      }`}
    >
      <span className="w-6 h-6">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </a>
  );
};

export default SideButton;
