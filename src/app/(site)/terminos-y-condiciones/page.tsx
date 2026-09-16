import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/data/coursesData";
import { DIAS_HABILES_TOPE, PORCENTAJE_INICIAL } from "@/lib/pagos";

export const metadata: Metadata = {
  title: `Términos y Condiciones | ${BRAND.company}`,
  description:
    "Condiciones de inscripción, formas de pago, reserva con inicial, plazos y política de reembolsos de los cursos de SS Consultores.",
};

const INICIAL_PCT = Math.round(PORCENTAJE_INICIAL * 100);

export default function TerminosPage() {
  return (
    <div className="bg-slate-50">
      <section className="bg-gradient-to-br from-brand-dark via-brand-800 to-brand-dark text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Términos y Condiciones
          </h1>
          <p className="mt-3 text-brand-200 text-sm sm:text-base">
            Condiciones de inscripción y pago de los cursos de {BRAND.company}.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10 space-y-10">
            <Clausula numero="1" titulo="Inscripción">
              <p>
                La inscripción a un curso se formaliza completando el formulario
                de la página del curso y enviando el comprobante del pago
                realizado. La inscripción queda en estado{" "}
                <strong>pendiente de verificación</strong> hasta que{" "}
                {BRAND.company} confirme el pago con el banco.
              </p>
              <p>
                Los datos suministrados deben ser veraces. {BRAND.company} podrá
                rechazar una inscripción cuando el comprobante no sea legible,
                la referencia no coincida o el monto no corresponda.
              </p>
            </Clausula>

            <Clausula numero="2" titulo="Formas de pago">
              <p>Puedes inscribirte de dos maneras:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Pago completo:</strong> abonas el total del curso al
                  momento de inscribirte y no queda saldo pendiente.
                </li>
                <li>
                  <strong>Reserva con inicial del {INICIAL_PCT}%:</strong>{" "}
                  abonas el {INICIAL_PCT}% del valor del curso para reservar tu
                  cupo y quedas obligado a pagar el {100 - INICIAL_PCT}%
                  restante dentro del plazo indicado en la cláusula 3.
                </li>
              </ul>
              <p>
                La opción de reserva con inicial solo está disponible en cursos
                con fecha de inicio confirmada y cuando aún queda plazo
                suficiente para completar el pago.
              </p>
            </Clausula>

            <Clausula
              numero="3"
              titulo={`Plazo para pagar el saldo (${DIAS_HABILES_TOPE} días hábiles)`}
              destacada
            >
              <p>
                Al elegir la reserva con inicial del {INICIAL_PCT}%,{" "}
                <strong>
                  aceptas que debes pagar el saldo restante a más tardar{" "}
                  {DIAS_HABILES_TOPE} días hábiles antes de la fecha de inicio
                  del curso
                </strong>
                . Los días hábiles no incluyen sábados ni domingos.
              </p>
              <p>
                La fecha tope exacta se calcula automáticamente y se te muestra
                en la página al momento de inscribirte, y se repite en el correo
                de confirmación junto con los datos para realizar el pago.
              </p>
              <p>
                <strong>
                  Si el saldo no se recibe dentro de ese plazo, {BRAND.company}
                  podrá disponer del cupo y asignarlo a otra persona, y la
                  inicial pagada no será reembolsada.
                </strong>{" "}
                Esta condición existe porque los cupos presenciales son
                limitados y un cupo reservado y no pagado impide la
                participación de otro interesado.
              </p>
            </Clausula>

            <Clausula numero="4" titulo="Cupos presenciales">
              <p>
                Los cursos en modalidad presencial tienen cupos limitados por la
                capacidad del salón. El número disponible se muestra en la
                página del curso y se actualiza a medida que se confirman
                inscripciones.
              </p>
              <p>
                Cuando se agotan los cupos presenciales, la inscripción sigue
                disponible en modalidad online en vivo por Zoom, que no tiene
                límite de participantes.
              </p>
            </Clausula>

            <Clausula numero="5" titulo="Reembolsos y cambios">
              <p>
                Las iniciales abonadas para reservar un cupo{" "}
                <strong>no son reembolsables</strong> en caso de
                incumplimiento del plazo de pago descrito en la cláusula 3, ni
                ante la inasistencia del participante.
              </p>
              <p>
                Si {BRAND.company} cancela o reprograma un curso por causas
                propias, el participante podrá optar por el reembolso íntegro de
                lo abonado o por aplicar ese monto a otro curso.
              </p>
              <p>
                Los cambios de modalidad (de presencial a online o viceversa)
                están sujetos a disponibilidad de cupos y a la diferencia de
                precio correspondiente. Solicítalos por WhatsApp antes del
                inicio del curso.
              </p>
            </Clausula>

            <Clausula numero="6" titulo="Certificados y material">
              <p>
                El certificado digital se emite a los participantes que hayan
                completado el pago total del curso. Un saldo pendiente impide la
                emisión del certificado.
              </p>
              <p>
                El material y las grabaciones, cuando el curso los incluya, son
                para uso personal del participante y no pueden reproducirse ni
                distribuirse sin autorización escrita de {BRAND.company}.
              </p>
            </Clausula>

            <Clausula numero="7" titulo="Datos personales">
              <p>
                Los datos que suministras se utilizan únicamente para gestionar
                tu inscripción, emitir tu certificado y comunicarte información
                del curso. No se ceden a terceros ajenos a la prestación del
                servicio.
              </p>
            </Clausula>

            <Clausula numero="8" titulo="Contacto">
              <p>
                Para cualquier consulta sobre estas condiciones, escríbenos por
                WhatsApp al <strong>{BRAND.phone}</strong> o al correo{" "}
                <strong>{BRAND.email}</strong>.
              </p>
              <p className="text-sm text-slate-500">
                {BRAND.company} · {BRAND.address}
              </p>
            </Clausula>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-brand-700 font-semibold hover:underline"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Clausula({
  numero,
  titulo,
  children,
  destacada = false,
}: {
  numero: string;
  titulo: string;
  children: React.ReactNode;
  destacada?: boolean;
}) {
  return (
    <section
      className={
        destacada
          ? "rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"
          : undefined
      }
    >
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
        <span className="text-brand-600">{numero}.</span> {titulo}
      </h2>
      <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-slate-600">
        {children}
      </div>
    </section>
  );
}
