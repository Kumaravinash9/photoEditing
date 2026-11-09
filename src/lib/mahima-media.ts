import type { DrivePhoto } from "@/lib/mock-data";

export type MahimaPhoto = DrivePhoto & { alt: string };

export const MAHIMA_PHOTOS: MahimaPhoto[] = [
  {
    id: "mahima-01",
    name: "sofa-quiet.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "/mahima/01.jpg",
    url: "/mahima/01.jpg",
    source: "sample",
    alt: "Mahima sitting on the sofa, looking down at the white dupatta in her hands",
  },
  {
    id: "mahima-02",
    name: "sofa-still.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "/mahima/02.jpg",
    url: "/mahima/02.jpg",
    source: "sample",
    alt: "Mahima sitting on the sofa with her eyes closed, one hand resting forward",
  },
  {
    id: "mahima-03",
    name: "diwali-floor.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "/mahima/03.jpg",
    url: "/mahima/03.jpg",
    source: "sample",
    alt: "Mahima leaning toward a row of diyas and marigolds, smiling at the camera",
  },
  {
    id: "mahima-reel-b-02",
    name: "fairy-lights.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "/mahima/reels/reel-b-02.jpg",
    url: "/mahima/reels/reel-b-02.jpg",
    source: "sample",
    alt: "Mahima dancing in blue, hands raised, fairy lights along the curtains",
  },
  {
    id: "mahima-reel-b-07",
    name: "the-clap.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "/mahima/reels/reel-b-07.jpg",
    url: "/mahima/reels/reel-b-07.jpg",
    source: "sample",
    alt: "Mahima clapping toward her friend between songs",
  },
  {
    id: "mahima-reel-b-10",
    name: "the-laugh.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "/mahima/reels/reel-b-10.jpg",
    url: "/mahima/reels/reel-b-10.jpg",
    source: "sample",
    alt: "Mahima laughing with her friend, fairy lights behind them",
  },
  {
    id: "mahima-reel-a-01",
    name: "car-face.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "/mahima/reels/reel-a-01.jpg",
    url: "/mahima/reels/reel-a-01.jpg",
    source: "sample",
    alt: "Mahima in the car, glasses on, making a face at the camera",
  },
  {
    id: "mahima-reel-a-10",
    name: "car-smile.jpg",
    mimeType: "image/jpeg",
    thumbnailUrl: "/mahima/reels/reel-a-10.jpg",
    url: "/mahima/reels/reel-a-10.jpg",
    source: "sample",
    alt: "Mahima close to the lens in the car, mask pulled down, smiling",
  },
];

export const MAHIMA_VIDEOS = [
  {
    id: "mahima-video-1",
    src: "/mahima/video-1.mp4",
    label: "Mahima in the car, glasses on, being playful",
    caption: "Playful, and impossibly cute.",
    notes: ["Every expression, a little adorable.", "Charming in every single frame."],
  },
  {
    id: "mahima-video-2",
    src: "/mahima/video-2.mp4",
    label: "Mahima singing and clapping by the fairy lights",
    caption: "Singing, clapping, glowing.",
    notes: ["Fairy lights behind, and still the brightest.", "Joyful without even trying."],
  },
] as const;
