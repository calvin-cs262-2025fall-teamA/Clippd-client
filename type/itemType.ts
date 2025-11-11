export interface itemType {
  id: string;
  name: string;
  location: string;
  images: string[];
  rating: number;
  profilePic: string;
  reviews?: Review[];
}

export interface Review {
  id: number;
  reviewerName: string;
  reviewContent: string;
  date?: string;
}
