/**
 * Límite de peticiones por IP, en memoria del proceso.
 *
 * En Vercel cada instancia tiene su propia memoria, así que el límite real es
 * por instancia, no global. Sirve para frenar abuso automatizado —bots que
 * inundan el formulario o queman la cuota de Gemini— pero no es una defensa
 * exacta. Si el tráfico crece hasta necesitar precisión, hay que moverlo a un
 * almacén compartido (Upstash Redis o Vercel KV).
 */

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

/** Evita que el Map crezca sin control con IPs que ya expiraron. */
function pruneExpired(now: number): void {
  for (const [key, hit] of buckets) {
    if (hit.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** Segundos hasta que se libere el cupo. */
  retryAfter: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  // Barrido barato: solo cuando el Map ya acumuló bastante.
  if (buckets.size > 5000) pruneExpired(now);

  const hit = buckets.get(key);

  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  hit.count += 1;

  if (hit.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((hit.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, retryAfter: 0 };
}

/**
 * IP del visitante. En Vercel llega en x-forwarded-for; la primera entrada es
 * el cliente y el resto son los proxies intermedios.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "desconocida";
}

export function tooManyRequests(retryAfter: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfter),
    },
  });
}
