"use client";

import { useMemo, useRef, useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Loader2,
  CreditCard,
  Smartphone,
  ChevronRight,
  Star,
  Upload,
  FileText,
  X,
} from "lucide-react";
import type { CoursePageData } from "@/sanity/queries";
import { BRAND } from "@/data/coursesData";
import { normalizeFeaturesList } from "@/lib/features";
import CertificationBadge from "./CertificationBadge";
import CourseGallery from "./CourseGallery";
import SmartChatbox from "./SmartChatbox";
import SmartNavLink from "./SmartNavLink";

type PaymentStep = "form" | "payment" | "success";

const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROOF_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

interface CourseLandingProps {
  course: CoursePageData;
}

export default function CourseLanding({ course }: CourseLandingProps) {
  const instructor = course.instructor;
  const [step, setStep] = useState<PaymentStep>("form");
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    telefono: "",
    correo: "",
  });
  const [reference, setReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const referenceValid = useMemo(
    () => /^\d{4,}$/.test(reference.replace(/\s/g, "")),
    [reference]
  );

  const canSubmitProof = referenceValid && !!proofFile && !submitting;

  const scrollToRegistration = () => {
    document.getElementById("registro")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep("payment");
    scrollToRegistration();
  };

  const validateProofFile = (file: File | null): string | null => {
    if (!file) return "Adjunta el comprobante de pago.";
    if (!ALLOWED_PROOF_TYPES.has(file.type)) {
      return "Formato no permitido. Usa JPG o PNG.";
    }
    if (file.size > MAX_PROOF_BYTES) {
      return "El archivo no puede superar 5 MB.";
    }
    return null;
  };

  const handleProofChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    const error = validateProofFile(file);
    setProofError(error);
    setProofFile(error ? null : file);
  };

  const clearProof = () => {
    setProofFile(null);
    setProofError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const fileError = validateProofFile(proofFile);
    if (!referenceValid || fileError || !proofFile) {
      setProofError(fileError);
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("studentName", formData.nombre.trim());
      body.append("idCard", formData.cedula.trim());
      body.append("phone", formData.telefono.trim());
      body.append("email", formData.correo.trim());
      body.append("courseId", course.id);
      body.append("referenceNumber", reference.replace(/\s/g, ""));
      body.append("paymentProof", proofFile);

      const res = await fetch("/api/enrollment", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setSubmitError(
          data.error || "No pudimos registrar tu inscripción. Intenta de nuevo."
        );
        return;
      }

      setStep("success");
      scrollToRegistration();
    } catch {
      setSubmitError(
        "Error de conexión. Revisa tu internet e intenta nuevamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <section
        className={`relative bg-gradient-to-br ${course.imageGradient} text-white overflow-hidden`}
      >
        {course.coverImageUrl && (
          <Image
            src={course.coverImageUrl}
            alt={course.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="text-sm md:text-base font-medium mb-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 max-w-full"
          >
            <Link
              href="/"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Inicio
            </Link>
            <ChevronRight
              className="w-4 h-4 text-white/40 shrink-0"
              aria-hidden="true"
            />
            <SmartNavLink
              sectionId="cursos"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Cursos
            </SmartNavLink>
            <ChevronRight
              className="w-4 h-4 text-white/40 shrink-0"
              aria-hidden="true"
            />
            <span className="text-white/90 line-clamp-1 min-w-0 max-w-[min(100%,20rem)] sm:max-w-md">
              {course.title}
            </span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center min-w-0">
            <div className="min-w-0 max-w-full">
              {course.featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue text-white text-xs font-bold mb-4">
                  <Star className="w-3 h-3 fill-white" />
                  CURSO DESTACADO
                </span>
              )}
              {course.certifiedBy && (
                <div className="mb-4 max-w-full">
                  <CertificationBadge
                    certifiedBy={course.certifiedBy}
                    variant="light"
                  />
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6 break-words">
                {course.title}
              </h1>
              <p className="text-lg text-white/90 leading-relaxed mb-8 whitespace-pre-line break-words">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={scrollToRegistration}
                  className="cta-pulse inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-blue hover:bg-brand-600 text-white font-bold text-lg shadow-xl transition-all"
                >
                  Reserva tu lugar
                </button>
              </div>
            </div>

            <div className="w-full max-w-full min-w-0 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-5 sm:p-7 space-y-5 overflow-hidden">
              <h2 className="text-lg font-bold text-white mb-2">Ficha del Curso</h2>
              <FichaItem icon={Calendar} label="Fecha" value={course.date} />
              <FichaItem icon={Clock} label="Horario" value={course.schedule} />
              <FichaItem icon={MapPin} label="Modalidad" value={course.modalityLabel} />
              {instructor && (
                <FichaItem icon={User} label="Facilitador" value={instructor.name} />
              )}
              <div className="pt-4 border-t border-white/20 min-w-0">
                <p className="text-white/70 text-sm">Inversión</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-brand-300 break-words">
                  ${course.price}{" "}
                  <span className="text-lg font-medium text-white/80">
                    {course.currency}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CourseGallery images={course.gallery} courseTitle={course.title} />

      <section className="py-16 bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 min-w-0">
            <div className="lg:col-span-2 min-w-0 max-w-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                ¿Qué aprenderás?
              </h2>
              <ul className="grid sm:grid-cols-2 gap-4 min-w-0">
                {normalizeFeaturesList(course.features).map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 p-4 rounded-xl bg-brand-50 border border-brand-100 min-w-0"
                  >
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 font-medium min-w-0 break-words">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {instructor && (
                <div className="mt-10 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start gap-4">
                    {instructor.photoUrl ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-brand-100">
                        <Image
                          src={instructor.photoUrl}
                          alt={instructor.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${instructor.avatarColor} flex items-center justify-center text-white font-bold text-xl shrink-0`}
                      >
                        {instructor.avatarInitials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">{instructor.name}</p>
                      <p className="text-sm text-brand-600">{instructor.role}</p>
                      <InstructorBio bio={instructor.bio} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 min-w-0 max-w-full">
              <div className="sticky top-24 space-y-6 min-w-0">
                <SmartChatbox
                  courseSlug={course.slug}
                  courseTitle={course.title}
                />

                <div
                  id="registro"
                  className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden scroll-mt-6"
                >
                <div className="bg-brand-dark text-white px-6 py-5">
                  <h2 className="text-xl font-bold">Reserva tu lugar</h2>
                  <p className="text-brand-200 text-sm mt-1">
                    {step === "form" && "Completa tus datos para continuar"}
                    {step === "payment" &&
                      "Realiza tu Pago Móvil y envía la referencia"}
                    {step === "success" && "Inscripción registrada"}
                  </p>
                </div>

                <div className="p-6">
                  {step === "form" && (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <FormField
                        label="Nombre completo"
                        id="nombre"
                        value={formData.nombre}
                        onChange={(v) => setFormData({ ...formData, nombre: v })}
                        required
                      />
                      <FormField
                        label="Cédula"
                        id="cedula"
                        value={formData.cedula}
                        onChange={(v) => setFormData({ ...formData, cedula: v })}
                        placeholder="V-12.345.678"
                        required
                      />
                      <FormField
                        label="Teléfono"
                        id="telefono"
                        type="tel"
                        value={formData.telefono}
                        onChange={(v) => setFormData({ ...formData, telefono: v })}
                        placeholder="0424-0000000"
                        required
                      />
                      <FormField
                        label="Correo electrónico"
                        id="correo"
                        type="email"
                        value={formData.correo}
                        onChange={(v) => setFormData({ ...formData, correo: v })}
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-brand-blue hover:bg-brand-600 text-white font-bold shadow-md transition-all cta-pulse"
                      >
                        Continuar al pago →
                      </button>
                    </form>
                  )}

                  {step === "payment" && (
                    <form onSubmit={handlePaymentSubmit} className="space-y-5">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Smartphone className="w-5 h-5 text-brand-600" />
                          <p className="font-semibold text-slate-800 text-sm">
                            Datos Pago Móvil
                          </p>
                        </div>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500 shrink-0">Banco</dt>
                            <dd className="font-medium min-w-0 text-right break-words">
                              {BRAND.pagoMovil.banco}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500 shrink-0">Teléfono</dt>
                            <dd className="font-medium min-w-0 text-right break-words">
                              {BRAND.pagoMovil.telefono}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500 shrink-0">Cédula</dt>
                            <dd className="font-medium min-w-0 text-right break-words">
                              {BRAND.pagoMovil.cedula}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-t border-slate-200 pt-2 mt-2">
                            <dt className="text-slate-500 shrink-0">Monto</dt>
                            <dd className="font-bold text-brand-700 min-w-0 text-right">
                              ${course.price} {course.currency}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <FormField
                        label="Número de referencia"
                        id="referencia"
                        value={reference}
                        onChange={(v) => {
                          setReference(v);
                          setSubmitError(null);
                        }}
                        placeholder="Ej: 123456789"
                        required
                      />

                      <div>
                        <label
                          htmlFor="comprobante"
                          className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                          Comprobante de pago
                        </label>
                        <input
                          ref={fileInputRef}
                          id="comprobante"
                          type="file"
                          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                          className="sr-only"
                          onChange={handleProofChange}
                        />
                        {!proofFile ? (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-brand-blue hover:bg-brand-50/40 px-4 py-6 text-center transition-colors"
                          >
                            <Upload className="w-6 h-6 text-brand-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-700">
                              Sube tu comprobante
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              JPG o PNG · máximo 5 MB
                            </p>
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                            <FileText className="w-5 h-5 text-brand-600 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {proofFile.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {(proofFile.size / 1024).toFixed(0)} KB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={clearProof}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              aria-label="Quitar archivo"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {proofError && (
                          <p className="mt-1.5 text-xs text-red-600" role="alert">
                            {proofError}
                          </p>
                        )}
                      </div>

                      {submitError && (
                        <p
                          className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2"
                          role="alert"
                        >
                          {submitError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={!canSubmitProof}
                        aria-busy={submitting}
                        className="w-full py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-700"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        {submitting ? "Enviando…" : "Enviar comprobante"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep("form")}
                        disabled={submitting}
                        className="w-full text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
                      >
                        ← Volver al formulario
                      </button>
                    </form>
                  )}

                  {step === "success" && (
                    <div className="py-2 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="font-bold text-slate-900 text-lg leading-snug">
                          ¡Inscripción registrada con éxito! Hemos recibido tu
                          número de referencia y el comprobante de pago.
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          En un plazo máximo de 24 horas laborables nuestro
                          equipo administrativo verificará la transacción en el
                          banco. Una vez validada, recibirás automáticamente un
                          correo electrónico con tus accesos a la clase, el
                          material descargable y el enlace de ingreso al grupo
                          oficial de WhatsApp.
                        </p>
                      </div>

                      <div className="rounded-xl border border-brand-blue/30 bg-brand-50 px-4 py-3 text-left">
                        <p className="text-sm text-brand-dark leading-relaxed">
                          📌 Nota importante sobre tu correo: Nuestro equipo
                          administrativo verificará la transacción en el banco
                          en un plazo máximo de 24 horas laborables. Si al pasar
                          este tiempo no ves el correo con tus accesos en tu
                          bandeja de entrada principal, por favor revisa tus
                          carpetas de Spam, Correo No Deseado o Promociones, y
                          agrega nuestra dirección corporativa a tus contactos
                          seguros para no perderte ningún material de la clase.
                        </p>
                      </div>

                      <p className="text-xs text-center text-slate-400">
                        Ref: {reference.replace(/\s/g, "")} · Estado: En Revisión
                      </p>
                    </div>
                  )}
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-20 lg:pb-24">
        <div className="max-w-5xl mx-auto my-16 p-8 bg-slate-50 md:bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <h3 className="text-2xl font-bold text-brand-dark mb-2">
            ¿Buscabas otra especialización o diplomado?
          </h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Explora nuestro catálogo académico completo y descubre todas las
            certificaciones profesionales que tenemos disponibles para ti.
          </p>
          <SmartNavLink
            sectionId="cursos"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-brand-blue hover:bg-brand-dark rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            ← Ver todos los cursos
          </SmartNavLink>
        </div>
      </section>

      {step === "form" && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white border-t border-slate-200 shadow-2xl lg:hidden z-40">
          <button
            type="button"
            onClick={scrollToRegistration}
            className="block w-full text-center py-3.5 rounded-xl bg-brand-blue text-white font-bold cta-pulse"
          >
            Reserva tu lugar — ${course.price}
          </button>
        </div>
      )}
    </div>
  );
}

function FichaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand-300" />
      </div>
      <div className="min-w-0">
        <p className="text-white/60 text-xs uppercase tracking-wider">{label}</p>
        <p className="text-white font-medium text-sm break-words">{value}</p>
      </div>
    </div>
  );
}

/** Primer bloque de bio: salto de párrafo, salto de línea, o primera oración. */
function getBioPreview(bio: string): string {
  const trimmed = bio.trim();
  if (!trimmed) return "";

  const byParagraph = trimmed.split(/\n\s*\n/)[0]?.trim();
  if (byParagraph && byParagraph.length < trimmed.length) return byParagraph;

  const byNewline = trimmed.split(/\n/)[0]?.trim();
  if (byNewline && byNewline.length < trimmed.length) return byNewline;

  const sentenceMatch = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  if (sentenceMatch && sentenceMatch[1].length < trimmed.length) {
    return sentenceMatch[1].trim();
  }

  return trimmed;
}

function InstructorBio({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false);
  const preview = getBioPreview(bio);
  const hasMore = preview.length < bio.trim().length;

  return (
    <div className="mt-2">
      <p className="hidden md:block text-sm text-slate-500 leading-relaxed whitespace-pre-line break-words">
        {bio}
      </p>

      <p className="md:hidden text-sm text-slate-500 leading-relaxed whitespace-pre-line break-words">
        {expanded || !hasMore ? bio : preview}
      </p>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="md:hidden mt-1.5 text-sm font-medium text-brand-blue hover:text-brand-600 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? "Ver menos" : "Ver más"}
        </button>
      )}
    </div>
  );
}

function FormField({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
      />
    </div>
  );
}
