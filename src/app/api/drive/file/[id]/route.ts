import { auth } from "@/lib/auth";
import { fetchDriveFile } from "@/lib/drive";


type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.googleAccessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const thumb = searchParams.get("thumb") === "1";
    const file = await fetchDriveFile(session.googleAccessToken, id, thumb);
    return new Response(file.body, {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "File fetch failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
