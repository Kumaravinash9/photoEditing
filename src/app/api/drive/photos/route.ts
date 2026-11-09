import { auth } from "@/lib/auth";
import { listAppFolderPhotos, samplePhotoLibrary } from "@/lib/drive";
import { googleConfigured } from "@/lib/mock-data";


export async function GET() {
  try {
    if (!googleConfigured()) {
      return Response.json({
        ...samplePhotoLibrary(),
        message: "Sample gallery — add Google OAuth secrets to connect Drive.",
      });
    }

    const session = await auth();
    if (!session?.googleAccessToken) {
      return Response.json(
        {
          ...samplePhotoLibrary(),
          message: "Connect Google Drive to load your Lumen Darkroom folder.",
          needsAuth: true,
        },
        { status: 200 },
      );
    }

    const library = await listAppFolderPhotos(session.googleAccessToken);
    return Response.json({
      ...library,
      message:
        library.photos.length === 0
          ? `Folder “${library.folderName}” is ready. Add images in Drive to edit them here.`
          : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Drive request failed";
    return Response.json(
      {
        ...samplePhotoLibrary(),
        error: message,
        message: "Could not reach Drive — showing sample photos.",
      },
      { status: 200 },
    );
  }
}
