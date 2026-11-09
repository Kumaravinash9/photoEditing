import { google } from "googleapis";
import { APP_FOLDER_NAME, SAMPLE_PHOTOS, type DrivePhoto } from "@/lib/mock-data";

function driveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth });
}

async function findOrCreateAppFolder(accessToken: string): Promise<string> {
  const drive = driveClient(accessToken);
  const existing = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${APP_FOLDER_NAME}' and trashed=false`,
    fields: "files(id, name)",
    spaces: "drive",
    pageSize: 1,
  });
  const found = existing.data.files?.[0]?.id;
  if (found) return found;

  const created = await drive.files.create({
    requestBody: {
      name: APP_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });
  if (!created.data.id) throw new Error("Could not create Drive folder");
  return created.data.id;
}

export async function listAppFolderPhotos(accessToken: string): Promise<{
  folderId: string;
  folderName: string;
  photos: DrivePhoto[];
  mode: "drive";
}> {
  const folderId = await findOrCreateAppFolder(accessToken);
  const drive = driveClient(accessToken);
  const listed = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false and (mimeType contains 'image/')`,
    fields: "files(id, name, mimeType, thumbnailLink, webContentLink)",
    orderBy: "modifiedTime desc",
    pageSize: 50,
  });

  const photos: DrivePhoto[] = (listed.data.files ?? []).map((file) => ({
    id: file.id!,
    name: file.name ?? "Untitled",
    mimeType: file.mimeType ?? "image/jpeg",
    thumbnailUrl: `/api/drive/file/${file.id}?thumb=1`,
    url: `/api/drive/file/${file.id}`,
    source: "drive" as const,
  }));

  return {
    folderId,
    folderName: APP_FOLDER_NAME,
    photos,
    mode: "drive",
  };
}

export async function fetchDriveFile(
  accessToken: string,
  fileId: string,
  thumb = false,
): Promise<{ body: ArrayBuffer; contentType: string }> {
  const drive = driveClient(accessToken);
  if (thumb) {
    const meta = await drive.files.get({
      fileId,
      fields: "thumbnailLink, mimeType",
    });
    if (meta.data.thumbnailLink) {
      const res = await fetch(meta.data.thumbnailLink);
      const buf = await res.arrayBuffer();
      return {
        body: buf,
        contentType: res.headers.get("content-type") ?? "image/jpeg",
      };
    }
  }

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );
  const meta = await drive.files.get({ fileId, fields: "mimeType" });
  const raw = res.data as ArrayBuffer | Buffer | Uint8Array;
  const body =
    raw instanceof ArrayBuffer
      ? raw
      : raw instanceof Uint8Array
        ? raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)
        : Uint8Array.from(raw as Buffer).buffer;
  return {
    body: body as ArrayBuffer,
    contentType: meta.data.mimeType ?? "application/octet-stream",
  };
}

export function samplePhotoLibrary() {
  return {
    folderId: "sample-folder",
    folderName: APP_FOLDER_NAME,
    photos: SAMPLE_PHOTOS,
    mode: "sample" as const,
  };
}
