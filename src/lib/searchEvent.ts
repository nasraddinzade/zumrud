// Каталог сообщает шапке, что поисковый запрос в адресе изменился,
// чтобы поле поиска показывало актуальный текст.
export const SEARCH_EVENT = "zumrud:search";

export function notifySearchChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SEARCH_EVENT));
}
