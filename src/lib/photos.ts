"use client";

import { createClient } from "@/lib/supabase/client";
import type { PhotoAngle, PhotoAssessment, ProgressPhoto } from "./types";

const BUCKET = "progress-photos";

/**
 * Upload a single photo file. Path convention: {user_id}/{date}/{angle}.{ext}
 */
export async function uploadPhoto(
  file: File,
  date: string,
  angle: PhotoAngle,
): Promise<ProgressPhoto> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not signed in");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const cleanExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const path = `${auth.user.id}/${date}/${angle}.${cleanExt}`;

  // Upload to Storage (overwrite if same path)
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;

  // Upsert DB record
  const { data, error } = await supabase
    .from("progress_photos")
    .upsert(
      {
        user_id: auth.user.id,
        check_in_date: date,
        angle,
        storage_path: path,
      },
      { onConflict: "user_id,check_in_date,angle" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as ProgressPhoto;
}

export async function listPhotos(): Promise<ProgressPhoto[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("progress_photos")
    .select("*")
    .order("check_in_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProgressPhoto[];
}

/** Group photos by check_in_date — returns sorted desc list of {date, photos} */
export function groupByCheckIn(photos: ProgressPhoto[]) {
  const map = new Map<string, ProgressPhoto[]>();
  for (const p of photos) {
    if (!map.has(p.check_in_date)) map.set(p.check_in_date, []);
    map.get(p.check_in_date)!.push(p);
  }
  return Array.from(map.entries())
    .map(([date, photos]) => ({ date, photos }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Get a short-lived signed URL for displaying a private photo */
export async function getSignedUrl(path: string, ttlSec = 600): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, ttlSec);
  if (error) throw error;
  return data.signedUrl;
}

export async function deletePhoto(photo: ProgressPhoto) {
  const supabase = createClient();
  if (photo.storage_path) {
    await supabase.storage.from(BUCKET).remove([photo.storage_path]);
  }
  if (photo.id) {
    await supabase.from("progress_photos").delete().eq("id", photo.id);
  }
}

export async function listAssessments(): Promise<PhotoAssessment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("photo_assessments")
    .select("*")
    .order("check_in_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PhotoAssessment[];
}
