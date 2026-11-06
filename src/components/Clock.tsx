"use client";
import { useEffect, useState } from "react";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export default function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    setT(fmt(new Date()));
    const id = setInterval(() => setT(fmt(new Date())), 15_000);
    return () => clearInterval(id);
  }, []);
  return <span className="clock">SGT {t}</span>;
}
