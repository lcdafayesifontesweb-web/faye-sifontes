import { useState } from "react";
import {
  type DocumentActionComponent,
  type DocumentActionProps,
} from "sanity";

type AbonoDoc = {
  paymentType?: string;
  abonos?: { montoUsd?: number; notificado?: boolean }[];
};

/**
 * Envía al alumno el recibo de los abonos que todavía no se le notificaron.
 *
 * Es un botón y no un envío automático al guardar: así se puede corregir un
 * monto mal tecleado antes de que salga el correo, y coincide con cómo ya
 * funciona el aviso de estado.
 */
export const NotifyAbonoAction: DocumentActionComponent = (
  props: DocumentActionProps
) => {
  const { id, type, draft, published, onComplete } = props;
  const [busy, setBusy] = useState(false);

  if (type !== "enrollment") return null;

  const doc = (draft ?? published) as AbonoDoc | null;
  if (doc?.paymentType !== "inicial") return null;

  const pendientes = (doc?.abonos ?? []).filter(
    (a) => typeof a?.montoUsd === "number" && a.montoUsd > 0 && !a.notificado
  );
  if (pendientes.length === 0) return null;

  const etiqueta =
    pendientes.length === 1
      ? "Enviar recibo de abono"
      : `Enviar recibo (${pendientes.length} abonos)`;

  return {
    label: busy ? "Enviando…" : etiqueta,
    disabled: busy,
    onHandle: async () => {
      setBusy(true);
      try {
        const res = await fetch("/api/enrollment/notify-abono", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enrollmentId: id.replace(/^drafts\./, ""),
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          skipped?: boolean;
          message?: string;
          saldoRestante?: number;
          saldado?: boolean;
        };

        if (!res.ok || !data.ok) {
          window.alert(
            data.error || "No se pudo enviar el recibo al alumno."
          );
        } else if (data.skipped) {
          window.alert(data.message || "No hay abonos nuevos por notificar.");
        } else if (data.saldado) {
          window.alert(
            "Recibo enviado. El alumno ya no tiene saldo pendiente."
          );
        } else {
          window.alert(
            `Recibo enviado. Saldo pendiente del alumno: $${data.saldoRestante} USD.`
          );
        }

        onComplete();
      } catch (err) {
        console.error(err);
        window.alert("Hubo un error al enviar el recibo. Intenta de nuevo.");
      } finally {
        setBusy(false);
      }
    },
  };
};
