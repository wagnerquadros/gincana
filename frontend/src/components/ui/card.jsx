import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cn("bg-white border border-gray-200 rounded-2xl", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}
