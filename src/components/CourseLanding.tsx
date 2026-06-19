"use client";

import { useState, FormEvent } from "react";
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
  Mail,
  MessageCircle,
  ArrowLeft,
  Star,
} from "lucide-react";
import type { CoursePageData } from "@/sanity/queries";
import { BRAND } from "@/data/coursesData";
import CertificationBadge from "./CertificationBadge";
import CourseGallery from "./CourseGallery";
import SmartChatbox from "./SmartChatbox";

type PaymentStep = "form" | "payment" | "verifying" | "confirmed";

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

  const scrollToRegistration = () => {
    document.getElementById("registro")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep("payment");
    scrollToRegistration();
  };

  const handlePaymentSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep("verifying");
    scrollToRegistration();
  };

  const handleConfirmPayment = () => {
    setStep("confirmed");
    scrollToRegistration();
  };

  return (
    <div className="min-h-screen bg-slate-50">
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              {course.featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue text-white text-xs font-bold mb-4">
                  <Star className="w-3 h-3 fill-white" />
                  CURSO DESTACADO
                </span>
              )}
              {course.certifiedBy && (
                <div className="mb-4">
                  <CertificationBadge
                    certifiedBy={course.certifiedBy}
                    variant="light"
                  />
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
                {course.title}
              </h1>
              <p className="text-lg text-white/90 leading-relaxed mb-8 whitespace-pre-line">
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

            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-7 space-y-5">
              <h2 className="text-lg font-bold text-white mb-2">Ficha del Curso</h2>
              <FichaItem icon={Calendar} label="Fecha" value={course.date} />
              <FichaItem icon={Clock} label="Horario" value={course.schedule} />
              <FichaItem icon={MapPin} label="Modalidad" value={course.modalityLabel} />
              {instructor && (
                <FichaItem icon={User} label="Facilitador" value={instructor.name} />
              )}
              <div className="pt-4 border-t border-white/20">
                <p className="text-white/70 text-sm">Inversión</p>
                <p className="text-4xl font-extrabold text-brand-300">
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

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                ¿Qué aprenderás?
              </h2>
              <ul className="grid sm:grid-cols-2 gap-4">
                {course.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 p-4 rounded-xl bg-brand-50 border border-brand-100"
                  >
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 font-medium">{feature}</span>
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
                    <div>
                      <p className="font-bold text-slate-900">{instructor.name}</p>
                      <p className="text-sm text-brand-600">{instructor.role}</p>
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed whitespace-pre-line">
                        {instructor.bio}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div id="registro" className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <SmartChatbox
                  courseSlug={course.slug}
                  courseTitle={course.title}
                />

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-brand-dark text-white px-6 py-5">
                  <h2 className="text-xl font-bold">Reserva tu lugar</h2>
                  <p className="text-brand-200 text-sm mt-1">
                    {step === "form" && "Completa tus datos para continuar"}
                    {step === "payment" && "Realiza tu Pago Móvil y envía la referencia"}
                    {step === "verifying" && "Verificación de pago en proceso"}
                    {step === "confirmed" && "¡Inscripción confirmada!"}
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
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Banco</dt>
                            <dd className="font-medium">{BRAND.pagoMovil.banco}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Teléfono</dt>
                            <dd className="font-medium">{BRAND.pagoMovil.telefono}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Cédula</dt>
                            <dd className="font-medium">{BRAND.pagoMovil.cedula}</dd>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                            <dt className="text-slate-500">Monto</dt>
                            <dd className="font-bold text-brand-700">
                              ${course.price} {course.currency}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <FormField
                        label="Número de referencia"
                        id="referencia"
                        value={reference}
                        onChange={setReference}
                        placeholder="Ej: 123456789"
                        required
                      />

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Enviar comprobante
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep("form")}
                        className="w-full text-sm text-slate-500 hover:text-slate-700"
                      >
                        ← Volver al formulario
                      </button>
                    </form>
                  )}

                  {step === "verifying" && (
                    <div className="text-center py-6">
                      <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto mb-4" />
                      <h3 className="font-bold text-slate-900 text-lg mb-2">
                        Verificación de Pago Móvil en proceso
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4">
                        Estamos validando tu pago. Este proceso puede tomar unos
                        minutos. Te notificaremos por correo y WhatsApp.
                      </p>
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-6">
                        Ref: {reference || "—"} · Estado: Pendiente de verificación
                      </div>
                      <button
                        type="button"
                        onClick={handleConfirmPayment}
                        className="w-full py-3.5 rounded-xl border-2 border-brand-blue bg-brand-blue hover:bg-brand-600 text-white font-bold transition-all"
                      >
                        Pago Confirmado
                      </button>
                      <p className="text-xs text-slate-400 mt-3">
                        Simulación admin — confirma el pago manualmente
                      </p>
                    </div>
                  )}

                  {step === "confirmed" && (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-xl mb-2">
                        ¡Pago confirmado!
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-6">
                        Tu inscripción a <strong>{course.title}</strong> ha sido
                        procesada exitosamente.
                      </p>

                      <div className="space-y-3 text-left">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                          <Mail className="w-5 h-5 text-green-600 shrink-0" />
                          <p className="text-xs text-green-800">
                            Credenciales enviadas a{" "}
                            <strong>{formData.correo || "tu correo"}</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                          <MessageCircle className="w-5 h-5 text-green-600 shrink-0" />
                          <p className="text-xs text-green-800">
                            Confirmación por WhatsApp al{" "}
                            <strong>{formData.telefono || "tu teléfono"}</strong>
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mt-6">
                        (Simulación UI — integración real pendiente)
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
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand-300" />
      </div>
      <div>
        <p className="text-white/60 text-xs uppercase tracking-wider">{label}</p>
        <p className="text-white font-medium text-sm">{value}</p>
      </div>
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
