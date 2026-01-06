export interface Product {
  id: string;
  name: string;
  category?: string; 
  description?: string;
  price: number;
  basePrice?: number;
  colors: string[];
  sizes: string[];
  images: ProductImage[];
  sizeGuide?: string;
}

export interface ProductImage {
  color: string;
  urls: string[];
}

export interface ProductsResponse {
  products: Product[];
  categories?: string[];
  bundleDiscount: number;
  promoCodesVisible: boolean;
}

export const COLOR_MAP: { [key: string]: string } = {
  'Military Green': '#4a5d4f',
  'Military Tilla': '#4a5d4f',
  'Blue Navy': '#1e3a5f',
  'Blue Nesio': '#1e3a5f',
  'Dark Heather': '#3c3c3c',
  'Grey Smokerz': '#3c3c3c',
  'Maroon': '#800020',
  'Red Panzer': '#800020',
  'Dark Chocolate': '#3d2b1f',
  'Chocolate Carma': '#3d2b1f',
  'Black': '#000000',
  'White': '#ffffff',
  'Grey': '#808080',
  'Red': '#dc2626',
  'Blue': '#2563eb'
};
