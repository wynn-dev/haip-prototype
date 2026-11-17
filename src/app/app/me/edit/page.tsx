import { requireUser } from "@/lib/auth";
import { loadDraft } from "@/lib/load-profile";
import { EditForm } from "./edit-form";

export const metadata = { title: "Edit profile" };

export default async function EditPage() {
  const user = await requireUser();
  return <EditForm initial={await loadDraft(user)} />;
}
