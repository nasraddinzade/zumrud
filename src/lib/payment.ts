// DEMO ONLY. Здесь в продакшне будет вызов платёжного шлюза epoint.az
// Сейчас оплата имитируется задержкой, никакие данные карты не собираются.
export async function simulatePayment(): Promise<{ orderId: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { orderId: generateOrderId() };
}

export function generateOrderId(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `ZP-${digits}`;
}

// +994 и девять цифр. Пробелы, дефисы и скобки допускаются при вводе.
export function isValidPhone(raw: string): boolean {
  const compact = raw.replace(/[\s\-()]/g, "");
  return /^\+994\d{9}$/.test(compact);
}
