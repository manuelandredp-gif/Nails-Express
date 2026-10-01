import sanitizeHtml from "sanitize-html";

/**
 * Limpia el HTML de los artículos del blog dejando solo etiquetas de formato
 * seguras (las que produce el editor TipTap). Elimina <script>, manejadores
 * on*, iframes y cualquier vector de XSS.
 */
export function sanitizePostHtml(dirty: string | null | undefined): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "strike", "del", "mark", "sub", "sup",
      "ul", "ol", "li", "blockquote", "pre", "code", "span",
      "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      span: ["class"],
      "*": ["style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    allowProtocolRelative: false,
    // Fuerza enlaces externos seguros.
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
    },
    // Solo estilos inocuos.
    allowedStyles: {
      "*": {
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        color: [/^#(0x)?[0-9a-fA-F]+$/, /^rgb\(/],
        "background-color": [/^#(0x)?[0-9a-fA-F]+$/, /^rgb\(/],
      },
    },
  });
}
