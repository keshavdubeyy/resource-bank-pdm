import { redirect } from "next/navigation"

// Editing now happens in a Sheet opened directly from the resource's card on
// /my-resources, not a standalone page. Keeping this redirect so any
// bookmarked or shared edit links still land somewhere useful.
export default function EditResourcePage() {
  redirect("/my-resources")
}
