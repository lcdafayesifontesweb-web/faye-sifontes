"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-2xl border border-brand-gray/30 bg-white overflow-hidden shadow-sm"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-brand-50/50 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-brand-dark">{item.title}</span>
              <ChevronDown
                className={`w-5 h-5 text-brand-blue shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-6 text-brand-dark/70 text-sm leading-relaxed border-t border-brand-gray/20 pt-4">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
