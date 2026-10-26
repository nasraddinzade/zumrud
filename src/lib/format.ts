import { CURRENCY_SYMBOL } from "@/config";

// Цена в манатах: число, неразрывный пробел, символ ₼. Например «125 ₼».
export function formatPrice(amount: number): string {
  return `${amount} ${CURRENCY_SYMBOL}`;
}

export function formatVolume(ml: number): string {
  return `${ml} ml`;
}
