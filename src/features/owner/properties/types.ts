export interface RoomFormData {
  id: string;
  name: string;
  type: string;
  gender: string;
  capacity: number;
  occupied: number;
  price: number;
  priceType: 'person' | 'room';
  amenities: string[];
}

export interface PropertyFormData {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  mapPin: { lat: number; lng: number };
  rooms: RoomFormData[];
  amenities: string[];
  rules: string;
}

export interface ImageItem {
  url: string;
  storageId?: string; // If from DB
  file?: File; // If newly uploaded
}
