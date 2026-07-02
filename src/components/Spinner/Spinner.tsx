import { CircleNotch } from "@phosphor-icons/react";
import "./Spinner.css";

export default function Spinner({ size = 16 }: { size?: number } = {}) {
  return <CircleNotch size={size} className="btn-spinner" weight="bold" />;
}
