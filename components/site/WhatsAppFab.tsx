"use client";
import { motion } from "framer-motion";
import { WhatsAppIcon } from "./icons";

export function WhatsAppFab({ href, label }: { href: string; label: string }) {
  return (
    <motion.a
      href={href || "#booking"}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      aria-label={label}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
      className="group fixed bottom-6 end-6 z-40 grid h-16 w-16 place-items-center rounded-full bg-whatsapp text-white shadow-[0_15px_35px_-10px_rgba(31,143,78,.75)] transition hover:scale-105"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-whatsapp/40 [animation-duration:2.5s]" />
      <WhatsAppIcon className="relative h-7 w-7" />
    </motion.a>
  );
}
