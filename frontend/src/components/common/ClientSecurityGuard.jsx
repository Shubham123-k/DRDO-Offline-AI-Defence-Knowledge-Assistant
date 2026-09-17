import { useEffect } from "react";

/**
 * Client-side security hardening.
 *
 * This is a deterrent, not a replacement for backend authorization or
 * encryption. Browser users can ultimately bypass client-side JavaScript.
 */
export default function ClientSecurityGuard() {
  useEffect(() => {
    const preventContextMenu = (event) => {
      event.preventDefault();
    };

    const preventDevToolsShortcuts = (event) => {
      const key = String(event.key || "").toLowerCase();
      const code = String(event.code || "").toLowerCase();
      const ctrlOrMeta = event.ctrlKey || event.metaKey;

      // Direct DevTools key.
      if (event.key === "F12" || event.keyCode === 123) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // Chrome/Edge/Firefox DevTools shortcuts:
      // Ctrl/Cmd + Shift + I/J/C and Ctrl/Cmd + Shift + F (where supported).
      if (ctrlOrMeta && event.shiftKey && ["i", "j", "c", "f"].includes(key)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // View Source shortcut.
      if (ctrlOrMeta && key === "u") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // Some browsers report function-key shortcuts through `code`.
      if (code === "f12") {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", preventContextMenu, true);
    document.addEventListener("keydown", preventDevToolsShortcuts, true);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu, true);
      document.removeEventListener("keydown", preventDevToolsShortcuts, true);
    };
  }, []);

  return null;
}
