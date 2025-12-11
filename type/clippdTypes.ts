export interface Service {
  id: number;
  clipperID: number;
  serviceName: string;
  price?: number;
  durationMinutes?: number | null;
}

export interface ClipperProfile {
  id: string;
  userId?: string | number; // UserAccount ID for language/specialty queries
  name: string;
  location: string;
  images: string[];
  rating: string;
  profilePic: string;
  bio?: string;
  address?: string;
  reviews?: Review[];
  services?: Service[];
}

export interface Review {
  id: number;
  clientID?: number;
  reviewerName: string;
  reviewContent?: string;
  comment?: string;
  rating?: number;
  date?: string;
  createdAt?: string;
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
