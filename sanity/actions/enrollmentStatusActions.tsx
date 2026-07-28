import { useState } from "react";
import {
  type DocumentActionComponent,
  type DocumentActionProps,
  useClient,
  useDocumentOperation,
} from "sanity";

type StatusValue = "approved" | "rejected";

function createStatusAction(
  status: StatusValue,
  label: string,
  tone: "positive" | "critical"
): DocumentActionComponent {
  const Action: DocumentActionComponent = (props: DocumentActionProps) => {
    const { id, type, published, draft, onComplete } = props;
    const { patch, publish } = useDocumentOperation(id, type);
    const client = useClient({ apiVersion: "2024-01-01" });
    const [busy, setBusy] = useState(false);

    if (type !== "enrollment") return null;

    const current =
      (draft?.status as string | undefined) ??
      (published?.status as string | undefined);
    const alreadySent =
      ((draft?.statusEmailSent as string | undefined) ??
        (published?.statusEmailSent as string | undefined)) === status;

    // Solo mostrar si aún no está en ese estado notificado
    if (current === status && alreadySent) return null;

    return {
      label: busy ? "Enviando…" : label,
      tone,
      disabled: busy || Boolean(patch.disabled) || Boolean(publish.disabled),
      onHandle: async () => {
        setBusy(true);
        try {
          patch.execute([{ set: { status } }]);

          // Publicar si hay draft o para asegurar versión publicada
          if (!publish.disabled) {
            publish.execute();
          }

          // Esperar a que Sanity persista el patch
          await new Promise((r) => setTimeout(r, 1200));

          const publishedId = id.replace(/^drafts\./, "");
          await client
            .patch(publishedId)
            .set({ status })
            .commit({ visibility: "sync" })
            .catch(() => undefined);

          const res = await fetch("/api/enrollment/notify-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enrollmentId: publishedId }),
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
                "El estado se guardó, pero el correo al alumno no se pudo enviar. Revisa Resend."
            );
          } else if (data.skipped) {
            window.alert(data.message || "El alumno ya había sido notificado.");
          } else {
            window.alert(
              status === "approved"
                ? "Pago confirmado y correo de bienvenida enviado al alumno."
                : "Inscripción rechazada y correo de aviso enviado al alumno."
            );
          }

          onComplete();
        } catch (err) {
          console.error(err);
          window.alert(
            "Hubo un error al confirmar y notificar. Intenta de nuevo."
          );
        } finally {
          setBusy(false);
        }
      },
    };
  };

  return Action;
}

export const ConfirmEnrollmentAction = createStatusAction(
  "approved",
  "Confirmar pago y notificar",
  "positive"
);

export const RejectEnrollmentAction = createStatusAction(
  "rejected",
  "Rechazar y notificar",
  "critical"
);
