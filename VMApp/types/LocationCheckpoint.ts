export interface ImageType {
  uri: string;
  width: number;
  height: number;
  type?: string;
}

export interface LocationCheckpoint {
  latitude: number;
  longitude: number;
  createdAt: string;
  images: ImageType[];
  note: string;
}
