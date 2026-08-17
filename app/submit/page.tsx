import { redirect } from "next/navigation"

// Add Resource now happens through a Sheet triggered from the header or
// Browse Folders, not a standalone page. Keeping this redirect so any
// bookmarked or shared /submit links still land somewhere useful.
export default function SubmitPage() {
  redirect("/")
}
