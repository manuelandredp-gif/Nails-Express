"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export interface FaqItem {
  id: string;
  pregunta: string;
  respuesta: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
  showTitle?: boolean;
}

export default function FaqAccordion({
  faqs,
  showTitle = true,
}: FaqAccordionProps) {
  // First item open by default as in reference image 11
  const [openId, setOpenId] = useState<string | null>(
    faqs.length > 0 ? faqs[0].id : null
  );

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Preguntas frecuentes
            </h2>
            <p className="mt-3 text-base text-[#6B6B6B]">
              Resolvemos tus dudas.
            </p>
          </div>
        )}

        {/* Accordion container */}
        <div className="space-y-3.5">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-[#ECECEC] rounded-[14px] overflow-hidden bg-white transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left py-4 sm:py-5 px-5 sm:px-6 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="text-base font-bold text-[#1A1A1A] pr-2">
                    {faq.pregunta}
                  </span>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[#6B6B6B] hover:text-primary transition-colors">
                    {isOpen ? (
                      <Minus className="w-4 h-4 text-primary" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-0 animate-in fade-in-50 duration-200">
                    <p className="text-sm text-[#6B6B6B] leading-relaxed border-t border-gray-50 pt-3">
                      {faq.respuesta}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
