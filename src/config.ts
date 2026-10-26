// Переключатель демо-плашки. true: плашка «Demo versiya...» видна вверху каждой страницы.
export const SHOW_DEMO_BANNER = true;

export const STORE = {
  name: "Zümrüd Parfum",
  phone: "+994 55 636 36 06",
  phoneHref: "tel:+994556363606",
  whatsapp: "+994 51 812 13 17",
  whatsappHref: "https://wa.me/994518121317",
  instagram: "@zumrud_parfums",
  instagramHref: "https://instagram.com/zumrud_parfums",
  hours: "10:00 - 22:00",
  stores: [
    {
      id: "store-1",
      address: "Nəsimi rayonu, Süleyman Rəhimov 162, 1-ci mərtəbə",
    },
    {
      id: "store-2",
      address: "Nəsimi rayonu, Seyid Cəfər Pişəvəri 38",
    },
  ],
} as const;

export type StoreId = (typeof STORE.stores)[number]["id"];

export const CURRENCY_SYMBOL = "₼";
