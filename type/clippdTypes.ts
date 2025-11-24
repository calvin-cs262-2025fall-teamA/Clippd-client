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

export interface Users {
  id: number;
  firstName: string;
  lastName: string;
  loginID: string;
  passWord: string;
  role: "Client" | "Clipper";
  nickname?: string;
  address?: string;
  city: string;
  state: string;
  emailAddress: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date;
}
