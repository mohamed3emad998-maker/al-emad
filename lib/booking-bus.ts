"use client";
/** Tiny event bus so "Book this service" buttons can pre-fill the booking form. */
export const BOOK_EVENT = "alemad:book";

export function requestBooking(service: string) {
  window.dispatchEvent(new CustomEvent(BOOK_EVENT, { detail: { service } }));
  document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
