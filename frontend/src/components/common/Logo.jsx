import logoDark from "../../assets/logo_dark.svg";
import logoLight from "../../assets/logo_light.svg";
import useTheme from "../../hooks/useTheme";

export default function Logo({ className = "" }) {
  const { theme } = useTheme();

  return (
    <img
      src={theme === "dark" ? logoDark : logoLight}
      alt="DRDO AI Assistant"
      className={`h-12 w-auto ${className}`}
    />
  );
}