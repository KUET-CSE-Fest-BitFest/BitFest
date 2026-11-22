import type { ReactNode } from "react";

/* The one button and the one text link used across the site. Hover runs on transforms only:
   the arrow cell fills from below and a second arrow crosses in; the link's line wipes orange
   and its arrow swaps. Nothing changes size, so hovering never moves the layout. */

const Arrow = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
    <path d="M2 8h11.5M8.5 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
const ArrowOut = () => (
  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden>
    <path d="M2.5 9.5l7-7M4 2.5h5.5V8" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

type Common = { href: string; children: ReactNode; external?: boolean; className?: string; onClick?: () => void };
const ext = (external?: boolean) => (external ? { target: "_blank", rel: "noreferrer" } : {});

export function Button({ href, children, external, className = "", onClick, size = "md", variant = "solid" }: Common & { size?: "sm" | "md"; variant?: "solid" | "ghost" }) {
  return (
    <a href={href} {...ext(external)} onClick={onClick} className={`btn btn-${size} ${variant === "ghost" ? "btn-ghost" : ""} ${className}`}>
      <span className="btn-label">{children}</span>
      <span className="btn-cell" aria-hidden>
        <span className="btn-arrows"><Arrow /><Arrow /></span>
      </span>
    </a>
  );
}

export function TextLink({ href, children, external, className = "" }: Common) {
  return (
    <a href={href} {...ext(external)} className={`tlink ${className}`}>
      <span className="tlink-text">{children}</span>
      <span className="tlink-icon" aria-hidden>
        <span><ArrowOut /><ArrowOut /></span>
      </span>
    </a>
  );
}
