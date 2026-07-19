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
  courses?: { title: string; slug: string }[];
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
  /** Legado: string[]; nuevo: texto multilínea */
  features?: string | string[];
  price?: number;
  currency?: string;
  featured?: boolean;
  certifiedBy?: string;
  coverImage?: SanityImage;
  gallery?: SanityImage[];
  instructor?: SanityInstructor;
}
