/** The hero copy's footprint (kicker, title, lead, buttons), one padded box per line, in pixels
    relative to the hero section. Measured from each line's own text extent and its layout position,
    so the entrance animation's offset and any scroll transform don't skew it. Live scenes keep their
    players out of these boxes. */
export type CopyBox = { x0: number; y0: number; x1: number; y1: number };

export function copyRects(section: HTMLElement, pad = 26): CopyBox[] {
  const copy = section.querySelector("h1")?.parentElement;
  if (!copy) return [];
  const sr = section.getBoundingClientRect();
  return [...copy.children].flatMap((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const b = range.getBoundingClientRect();
    if (!b.width) return [];
    const shift = el.getBoundingClientRect().top - sr.top - copy.offsetTop - (el as HTMLElement).offsetTop;
    return [{ x0: b.left - sr.left - pad, y0: b.top - sr.top - shift - pad, x1: b.right - sr.left + pad, y1: b.bottom - sr.top - shift + pad }];
  });
}

/** True if (x, y) falls in any box, grown by r. */
export const inBoxes = (boxes: CopyBox[], x: number, y: number, r = 0) =>
  boxes.some((k) => x > k.x0 - r && x < k.x1 + r && y > k.y0 - r && y < k.y1 + r);
