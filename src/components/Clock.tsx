"use client";
import { useEffect, useState } from "react";

function fmt(d: Date) {
  const sgt = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${sgt.getUTCFullYear()}.${p(sgt.getUTCMonth() + 1)}.${p(sgt.getUTCDate())} ${p(sgt.getUTCHours())}:${p(sgt.getUTCMinutes())}:${p(sgt.getUTCSeconds())} SGT`;
}

export default function Clock() {
  const [t, setT] = useState<string>("");
  useEffect(() => {
    setT(fmt(new Date()));
    const id = setInterval(() => setT(fmt(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{t}</span>;
}
