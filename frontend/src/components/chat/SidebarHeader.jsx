import Logo from "../common/Logo";
import { PanelLeft } from "lucide-react";

export default function SidebarHeader() {
  return (
    <div className="flex items-center justify-between px-5 py-5">
      <Logo className="h-12 w-auto" />

      <button className="rounded-lg p-2 transition hover:bg-gray-200 dark:hover:bg-white/10">
        <PanelLeft size={22} />
      </button>
    </div>
  );
}
