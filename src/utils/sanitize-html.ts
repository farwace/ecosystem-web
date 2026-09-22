const allowedTags = new Set([
  'A', 'B', 'BR', 'CODE', 'DIV', 'EM', 'I', 'LI', 'OL', 'P', 'SPAN', 'STRONG', 'U', 'UL',
]);

const allowedProtocols = new Set(['http:', 'https:', 'mailto:']);

export function sanitizeHtml(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';

  const parsedDocument = new DOMParser().parseFromString(value, 'text/html');

  for (const element of Array.from(parsedDocument.body.querySelectorAll('*'))) {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      continue;
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const keepAttribute = name === 'class' || (element.tagName === 'A' && name === 'href');

      if (name.startsWith('on') || name === 'style' || name === 'src' || !keepAttribute) {
        element.removeAttribute(attribute.name);
      }
    }

    if (element.tagName === 'A') {
      const href = element.getAttribute('href');

      try {
        if (!href || !allowedProtocols.has(new URL(href, window.location.href).protocol)) {
          element.removeAttribute('href');
        } else {
          element.setAttribute('rel', 'noopener noreferrer');
          element.setAttribute('target', '_blank');
        }
      } catch {
        element.removeAttribute('href');
      }
    }
  }

  return parsedDocument.body.innerHTML;
}
