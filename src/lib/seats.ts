import type { SanityClient } from "next-sanity";

type EnrollmentSeatInfo = {
  courseId?: string | null;
  paymentModality?: string | null;
  seatDeducted?: boolean | null;
  seats?: number | null;
};

/**
 * Descuenta un cupo presencial al confirmar el pago de una inscripción.
 *
 * Todo lo que necesita lo lee de Sanity a partir del id de la inscripción, en
 * vez de recibirlo del llamador: el webhook entrega un payload externo cuya
 * forma se configura fuera del repo y podría venir incompleto.
 *
 * La aprobación puede procesarse por dos vías —el botón del Studio y el
 * webhook— y el endpoint del botón admite varias llamadas, así que la
 * inscripción queda marcada con `seatDeducted` y el cupo se resta una sola vez.
 *
 * Nunca baja de 0: si ya está en cero (por ventas cargadas a mano) se marca
 * igual, para no reintentarlo en cada llamada.
 */
export async function deductPresencialSeat(params: {
  client: SanityClient;
  enrollmentId: string;
}): Promise<{ deducted: boolean; reason?: string }> {
  const { client, enrollmentId } = params;
  const publishedId = enrollmentId.replace(/^drafts\./, "");

  try {
    const info = await client.fetch<EnrollmentSeatInfo | null>(
      `*[_type == "enrollment" && _id == $id][0]{
        "courseId": course._ref,
        paymentModality,
        seatDeducted,
        "seats": course->seatsPresencial
      }`,
      { id: publishedId }
    );

    if (!info) return { deducted: false, reason: "inscripción no encontrada" };
    if (info.paymentModality !== "presencial") {
      return { deducted: false, reason: "no es presencial" };
    }
    if (info.seatDeducted) {
      return { deducted: false, reason: "ya estaba descontado" };
    }
    if (!info.courseId) {
      return { deducted: false, reason: "la inscripción no tiene curso" };
    }
    // El curso no lleva control de cupos: no hay nada que descontar.
    if (typeof info.seats !== "number" || !Number.isFinite(info.seats)) {
      return { deducted: false, reason: "el curso no lleva control de cupos" };
    }

    if (info.seats > 0) {
      await client
        .patch(info.courseId)
        .set({ seatsPresencial: info.seats - 1 })
        .commit({ visibility: "sync" });
    }

    for (const targetId of [publishedId, `drafts.${publishedId}`]) {
      try {
        await client.patch(targetId).set({ seatDeducted: true }).commit();
      } catch {
        /* el borrador puede no existir */
      }
    }

    return { deducted: info.seats > 0 };
  } catch (err) {
    // Un fallo aquí no debe tumbar el correo al alumno, que es lo importante.
    console.error("[seats] no se pudo descontar el cupo:", err);
    return { deducted: false, reason: "error al descontar" };
  }
}
