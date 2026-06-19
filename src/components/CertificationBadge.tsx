import { Award } from "lucide-react";

interface CertificationBadgeProps {
  certifiedBy: string;
  variant?: "light" | "dark" | "card";
  className?: string;
}

export default function CertificationBadge({
  certifiedBy,
  variant = "card",
  className = "",
}: CertificationBadgeProps) {
  const variants = {
    light:
      "bg-white/20 backdrop-blur text-white border border-white/30",
    dark:
      "bg-brand-dark/10 text-brand-dark border border-brand-blue/20",
    card:
      "bg-brand-50 text-brand-dark border border-brand-blue/25",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      <Award className="w-3.5 h-3.5 text-brand-blue shrink-0" />
      Certificado por: {certifiedBy}
    </span>
  );
}
