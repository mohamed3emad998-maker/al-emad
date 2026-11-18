import type { BrandColors } from "./types";
import { hexToRgbTriplet } from "./utils";

/** CSS that applies the CMS brand colours to the whole site via CSS variables. */
export function themeCss(colors: BrandColors) {
  return `:root{--c-navy:${hexToRgbTriplet(colors.navy, "16 28 44")};--c-silver:${hexToRgbTriplet(
    colors.silver,
    "197 203 211"
  )};--c-red:${hexToRgbTriplet(colors.red, "214 40 40")};--c-charcoal:${hexToRgbTriplet(
    colors.charcoal,
    "23 25 29"
  )};--c-white:${hexToRgbTriplet(colors.white, "255 255 255")};}`;
}
