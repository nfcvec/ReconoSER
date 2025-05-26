// src/ui-components/FechaFormateada.jsx
import React from "react";

function pad(n) {
  return n < 10 ? `0${n}` : n;
}

export default function FechaFormateada({ value }) {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date)) return value;
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return (
    <span>{`${day}/${month}/${year} ${hours}:${minutes}:${seconds}`}</span>
  );
}
