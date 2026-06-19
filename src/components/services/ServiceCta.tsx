import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/whatsapp";

interface ServiceCtaProps {
  message: string;
  label: string;
  variant?: "primary" | "secondary";
}

export default function ServiceCta({
  message,
  label,
  variant = "primary",
}: ServiceCtaProps) {
  const href = getWhatsAppUrl(message);
  const styles =
    variant === "primary"
      ? "bg-brand-blue hover:bg-brand-600 text-white shadow-lg"
      : "border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white";

  return (
    <section className="py-16 bg-gradient-to-br from-brand-dark to-brand-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${styles}`}
        >
          {label}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
