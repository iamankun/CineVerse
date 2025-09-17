import { Mulish as FontMulish, Dosis as FontDosis } from "next/font/google";

export const Mulish = FontMulish({
  subsets: ["latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mulish",
});

export const Dosis = FontDosis({
  subsets: ["latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dosis",
});
