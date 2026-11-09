import { Suspense } from "react";
import { redirect } from "next/navigation";
import { EditorWorkspace } from "@/components/editor-workspace";
import { TOOLS_ENABLED } from "@/lib/features";

export default function EditorPage() {
  if (!TOOLS_ENABLED) redirect("/");

  return (
    <Suspense fallback={null}>
      <EditorWorkspace />
    </Suspense>
  );
}
