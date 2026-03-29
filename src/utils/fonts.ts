import { Mulish as FontMulish, Dosis as FontDosis } from "next/font/google";

export const Mulish = FontMulish({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mulish",
  display: "swap",
});

export const Dosis = FontDosis({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dosis",
  display: "swap",
});
