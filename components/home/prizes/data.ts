import { events, prizes } from "@/lib/fest";

export const ROWS = events.map((e, i) => ({ i, e, p: prizes[e.slug] }));
export const KNOWN_TOTAL = ROWS.reduce((a, r) => a + (r.p.total ?? 0), 0); // 505
export const PLACES = ["Champion", "1st runner-up", "2nd runner-up"] as const;
