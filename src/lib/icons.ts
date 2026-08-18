import {
  AppWindow,
  Boxes,
  Check,
  Cloud,
  Code2,
  Compass,
  Cpu,
  Database,
  Gauge,
  Layers,
  LifeBuoy,
  Lightbulb,
  PenTool,
  Rocket,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Icon names selectable from the admin panel. */
export const iconRegistry: Record<string, LucideIcon> = {
  AppWindow,
  Boxes,
  Check,
  Cloud,
  Code2,
  Compass,
  Cpu,
  Database,
  Gauge,
  Layers,
  LifeBuoy,
  Lightbulb,
  PenTool,
  Rocket,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Workflow,
  Wrench,
  Zap,
};

export const iconNames = Object.keys(iconRegistry);

export function getIcon(
  name: string | null | undefined,
  fallback: LucideIcon = Sparkles,
): LucideIcon {
  return (name && iconRegistry[name]) || fallback;
}
