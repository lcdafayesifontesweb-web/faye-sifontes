import type { ReactNode } from "react";
import { createElement, Fragment } from "react";
import {
  phoneToWhatsAppUrl,
  VE_MOBILE_PHONE_REGEX,
} from "@/lib/whatsapp";

/**
 * Renderiza texto del bot con:
 * - **negrita** básica
 * - números VE (0424-8979101) como links wa.me
 * - saltos de línea
 */
export function renderChatRichText(text: string): ReactNode {
  const lines = text.split(/\n/);
  const nodes: ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      nodes.push(createElement("br", { key: `br-${lineIdx}` }));
    }
    nodes.push(
      createElement(Fragment, { key: `line-${lineIdx}` }, ...parseInline(line, lineIdx))
    );
  });

  return createElement(Fragment, null, ...nodes);
}

function parseInline(segment: string, lineIdx: number): ReactNode[] {
  const phoneRe = new RegExp(VE_MOBILE_PHONE_REGEX.source, "g");
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let phoneIdx = 0;

  while ((match = phoneRe.exec(segment)) !== null) {
    if (match.index > last) {
      parts.push(...parseBold(segment.slice(last, match.index), `${lineIdx}-pre-${phoneIdx}`));
    }
    const raw = match[0];
    const href = phoneToWhatsAppUrl(raw);
    parts.push(
      createElement(
        "a",
        {
          key: `${lineIdx}-wa-${phoneIdx}`,
          href,
          target: "_blank",
          rel: "noopener noreferrer",
          className:
            "inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-md font-semibold text-white bg-[#25D366] hover:bg-[#1ebe57] transition-colors no-underline",
        },
        raw
      )
    );
    last = match.index + raw.length;
    phoneIdx += 1;
  }

  if (last < segment.length) {
    parts.push(...parseBold(segment.slice(last), `${lineIdx}-post`));
  }

  if (parts.length === 0) {
    return parseBold(segment, `${lineIdx}-only`);
  }
  return parts;
}

function parseBold(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const boldRe = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = boldRe.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    nodes.push(
      createElement("strong", { key: `${keyPrefix}-b-${i}` }, match[1])
    );
    last = match.index + match[0].length;
    i += 1;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }

  return nodes.length > 0 ? nodes : [text];
}
