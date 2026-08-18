import { createClient } from "@/utils/supabase/client"

const AUTH_ACTION_PARAM = "auth_action"
const AUTH_FOLDER_ID_PARAM = "folder_id"
const AUTH_PARENT_FOLDER_ID_PARAM = "parent_folder_id"

type AuthActionIntent =
  | "add-resource"
  | "create-folder"
  | "edit-resource"
  | "move-resource"
  | "rename-folder"
  | "delete-folder"

type AuthReturnOptions = {
  folderId?: string | null
  parentFolderId?: string | null
}

type AuthReturnIntent = {
  action: AuthActionIntent
  folderId?: string
  parentFolderId?: string
}

export async function signInWithGoogle(next: string) {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/client-callback?next=${encodeURIComponent(next)}`,
    },
  })
}

function buildAuthReturnPath(action: AuthActionIntent, options: AuthReturnOptions = {}): string {
  const url = new URL(window.location.href)
  url.searchParams.set(AUTH_ACTION_PARAM, action)

  if (options.folderId === undefined || options.folderId === null) {
    url.searchParams.delete(AUTH_FOLDER_ID_PARAM)
  } else {
    url.searchParams.set(AUTH_FOLDER_ID_PARAM, options.folderId)
  }

  if (options.parentFolderId === undefined || options.parentFolderId === null) {
    url.searchParams.delete(AUTH_PARENT_FOLDER_ID_PARAM)
  } else {
    url.searchParams.set(AUTH_PARENT_FOLDER_ID_PARAM, options.parentFolderId)
  }

  return `${url.pathname}${url.search}${url.hash}`
}

async function signInWithGoogleForAction(
  action: AuthActionIntent,
  options: AuthReturnOptions = {}
) {
  await signInWithGoogle(buildAuthReturnPath(action, options))
}

function readAuthReturnIntent(): AuthReturnIntent | null {
  const params = new URLSearchParams(window.location.search)
  const action = params.get(AUTH_ACTION_PARAM)
  if (
    action !== "add-resource" &&
    action !== "create-folder" &&
    action !== "edit-resource" &&
    action !== "move-resource" &&
    action !== "rename-folder" &&
    action !== "delete-folder"
  ) {
    return null
  }

  return {
    action,
    folderId: params.get(AUTH_FOLDER_ID_PARAM) ?? undefined,
    parentFolderId: params.get(AUTH_PARENT_FOLDER_ID_PARAM) ?? undefined,
  }
}

function clearAuthReturnIntent(): string {
  const url = new URL(window.location.href)
  url.searchParams.delete(AUTH_ACTION_PARAM)
  url.searchParams.delete(AUTH_FOLDER_ID_PARAM)
  url.searchParams.delete(AUTH_PARENT_FOLDER_ID_PARAM)
  return `${url.pathname}${url.search}${url.hash}`
}

export {
  clearAuthReturnIntent,
  readAuthReturnIntent,
  signInWithGoogleForAction,
  type AuthActionIntent,
}
