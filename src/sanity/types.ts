export interface SanityImage {
  _type?: string;
  asset?: {
    _ref: string;
    _type: string;
  };
  alt?: string;
}

export interface SanityInstructor {
  _id: string;
  name: string;
  role: string;
  bio: string;
  photo?: SanityImage;
}

export interface SanityCourse {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  date: string;
  schedule: string;
  modality: string;
  features?: string[];
  price?: number;
  currency?: string;
  featured?: boolean;
  certifiedBy?: string;
  coverImage?: SanityImage;
  instructor?: SanityInstructor;
}
