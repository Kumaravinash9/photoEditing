import { oauthStatus } from "@/lib/auth";


export async function GET() {
  return Response.json(oauthStatus());
}
