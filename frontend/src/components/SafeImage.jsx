import React, { useState } from "react";

const FALLBACK = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23E5EEF6'/%3E%3Cpath d='M160 130h80v40h-80z' fill='%23B7CBDD'/%3E%3Ccircle cx='185' cy='145' r='6' fill='%23fff'/%3E%3Cpath d='M175 165l15-15 20 15 15-10v10z' fill='%23fff'/%3E%3Ctext x='200' y='200' font-family='Arial' font-size='12' fill='%236B7F94' text-anchor='middle'%3EImage unavailable%3C/text%3E%3C/svg%3E";

export default function SafeImage({ src, alt = "", className = "", eager = false, ...rest }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed || !src ? FALLBACK : src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}
