import React from "react";

export default function SectionTitle({ eyebrow, title, subtitle, align = "center", className = "" }) {
  return (
    <div className={`${align === "center" ? "text-center max-w-3xl mx-auto" : "text-left max-w-2xl"} mb-12 ${className}`}>
      {eyebrow && (
        <div className={`pill bg-primary/10 text-primary mb-4 ${align === "center" ? "" : ""}`}>
          {eyebrow}
        </div>
      )}
      <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
