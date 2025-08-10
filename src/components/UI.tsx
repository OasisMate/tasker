"use client";
import { ComponentProps } from "react";

export function Button(
  props: ComponentProps<"button"> & { variant?: "primary" | "ghost" }
) {
  const { className = "", variant, ...rest } = props;
  const base = "button";
  const v = variant === "primary" ? "button-primary" : "";
  return <button {...rest} className={`${base} ${v} ${className}`} />;
}
export function Input(p: ComponentProps<"input">) {
  return <input {...p} className={`input ${p.className ?? ""}`} />;
}
export function Textarea(p: ComponentProps<"textarea">) {
  return <textarea {...p} className={`input ${p.className ?? ""}`} />;
}
export function Card(p: ComponentProps<"div">) {
  return <div {...p} className={`card ${p.className ?? ""}`} />;
}
