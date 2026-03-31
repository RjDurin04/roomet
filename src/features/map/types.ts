export type SortMode = 'recommended' | 'price-asc' | 'price-desc' | 'rating';

export interface ExplorerHouse {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  price: number;
  images: string[];
  amenities: string[];
  roomAmenities: string[];
  description: string;
  rating: number;
  distance: number;
  available: boolean;
  roomTypes: string[];
}
