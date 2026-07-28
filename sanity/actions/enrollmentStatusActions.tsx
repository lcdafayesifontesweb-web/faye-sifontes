import { useState } from "react";
import {
  type DocumentActionComponent,
  type DocumentActionProps,
  useClient,
  useDocumentOperation,
} from "sanity";

/**
 * Botón neutro: publica el estado elegido (Pago Confirmado / Rechazado)
 * y envía el correo correspondiente.
 */
export const NotifyEnrollmentAction: DocumentActionComponent = (
  props: DocumentActionProps
) => {
  const { id, type, draft, published, onComplete } = props;
  const { publish } = useDocumentOperation(id, type);
  const client = useClient({ apiVersion: "2024-01-01" });
  const [busy, setBusy] = useState(false);

  if (type !== "enrollment") return null;

  const displayed = draft ?? published;
  const status = displayed?.status as string | undefined;
  const statusEmailSent = displayed?.statusEmailSent as string | undefined;

  const isFinal = status === "approved" || status === "rejected";
  const alreadySent = isFinal && statusEmailSent === status;

  if (!isFinal || alreadySent) return null;

  const statusLabel =
    status === "approved" ? "Pago Confirmado" : "Rechazado";

  return {
    label: busy ? "Enviando…" : "Enviar",
    disabled: busy,
    onHandle: async () => {
      setBusy(true);
      try {
        const publishedId = id.replace(/^drafts\./, "");
        const finalStatus = status as "approved" | "rejected";

        // 1) Forzar estado en published y draft (evita carrera con Publicar)
        await client
          .patch(publishedId)
          .set({ status: finalStatus })
          .commit({ visibility: "sync" })
          .catch(() => undefined);
        await client
          .patch(`drafts.${publishedId}`)
          .set({ status: finalStatus })
          .commit({ visibility: "sync" })
          .catch(() => undefined);

        if (!publish.disabled) {
          publish.execute();
          await new Promise((r) => setTimeout(r, 1500));
        }

        // 2) Notificar pasando el status explícito
        const res = await fetch("/api/enrollment/notify-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enrollmentId: publishedId,
            status: finalStatus,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          skipped?: boolean;
          message?: string;
        };

        if (!res.ok || !data.ok) {
          window.alert(
            data.error ||
              "El estado se guardó, pero el correo al alumno no se pudo enviar."
          );
        } else if (data.skipped) {
          window.alert(data.message || "El alumno ya había sido notificado.");
        } else {
          window.alert(
            status === "approved"
              ? `Estado: ${statusLabel}. Correo de confirmación enviado al alumno.`
              : `Estado: ${statusLabel}. Correo de rechazo enviado al alumno.`
          );
        }

        onComplete();
      } catch (err) {
        console.error(err);
        window.alert("Hubo un error al enviar la notificación. Intenta de nuevo.");
      } finally {
        setBusy(false);
      }
    },
  };
};
