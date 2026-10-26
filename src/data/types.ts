export type Concentration = "EDP" | "EDT" | "Extrait" | "Oil";
export type Gender = "kisi" | "qadin" | "uniseks";

export type Notes = {
  top: string[];
  heart: string[];
  base: string[];
};

export type Product = {
  slug: string;
  brand: string;
  name: string;
  volumeMl: number;
  concentration: Concentration;
  gender: Gender;
  price: number;
  image: string; // /products/<slug>.webp
  imageSource?: string; // откуда взята картинка
  notes?: Notes;
  description?: { az: string; ru: string };
};
