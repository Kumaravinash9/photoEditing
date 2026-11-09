import type { Metadata } from "next";
import { PhotosGalleryForMahima } from "@/components/photos-gallery-for-mahima";

export const metadata: Metadata = {
  title: "For Mahima",
  description: "A small gallery kept for Mahima, then Google Drive and Spotify.",
};

export default function HomePage() {
  return <PhotosGalleryForMahima />;
}
