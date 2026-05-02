"use client";

import { useEffect, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Sparkles, Upload } from "lucide-react";
import {
  deletePhoto,
  getSignedUrl,
  groupByCheckIn,
  listAssessments,
  listPhotos,
  uploadPhoto,
} from "@/lib/photos";
import { NoApiKeyBanner } from "@/components/NoApiKeyBanner";
import { CompareSlider } from "@/components/ui/CompareSlider";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/Field";
import type {
  PhotoAngle,
  PhotoAssessment,
  Profile,
  ProgressPhoto,
} from "@/lib/types";

const ANGLES: PhotoAngle[] = ["front", "side", "back"];
const ANGLE_LABEL: Record<PhotoAngle, string> = {
  front: "Voorkant",
  side: "Zijkant",
  back: "Rug",
};

export function PhotosTab({ profile }: { profile: Profile }) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [assessments, setAssessments] = useState<PhotoAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  // upload state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [files, setFiles] = useState<Record<PhotoAngle, File | null>>({
    front: null,
    side: null,
    back: null,
  });
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // browse state
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [activeIdx, setActiveIdx] = useState(0); // index into checkIns
  const [activeAngle, setActiveAngle] = useState<PhotoAngle>("front");

  useEffect(() => {
    Promise.all([listPhotos(), listAssessments()])
      .then(([p, a]) => {
        setPhotos(p);
        setAssessments(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const checkIns = groupByCheckIn(photos);
  const current = checkIns[activeIdx];
  const previous = checkIns[activeIdx + 1];

  // Resolve signed URLs for visible photos
  useEffect(() => {
    const targets = [current, previous].filter(Boolean);
    const paths: string[] = [];
    targets.forEach((c) =>
      c?.photos.forEach((p) => {
        if (p.storage_path && !signedUrls[p.storage_path]) {
          paths.push(p.storage_path);
        }
      }),
    );
    if (paths.length === 0) return;
    Promise.all(paths.map(async (p) => [p, await getSignedUrl(p)] as const))
      .then((entries) => {
        setSignedUrls((u) => {
          const next = { ...u };
          for (const [p, url] of entries) next[p] = url;
          return next;
        });
      })
      .catch(() => {});
  }, [activeIdx, photos]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    setError(null);
    const fileEntries = ANGLES.map((a) => [a, files[a]] as const).filter(
      ([, f]) => f != null,
    );
    if (fileEntries.length === 0) {
      setError("Upload minstens 1 foto");
      return;
    }

    setUploading(true);
    try {
      for (const [angle, f] of fileEntries) {
        await uploadPhoto(f as File, date, angle as PhotoAngle);
      }
      const fresh = await listPhotos();
      setPhotos(fresh);
      // reset file inputs
      setFiles({ front: null, side: null, back: null });
      ANGLES.forEach((a) => {
        const el = document.getElementById(
          `photo-input-${a}`,
        ) as HTMLInputElement | null;
        if (el) el.value = "";
      });
    } catch (e: any) {
      setError(`Upload mislukt: ${e.message}`);
      setUploading(false);
      return;
    }
    setUploading(false);

    // Trigger AI assessment
    if (false) {
      setNeedsKey(true);
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch("/api/photo-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      if (res.status === 402) {
        setNeedsKey(true);
        setAnalyzing(false);
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "AI assessment mislukt");
      }
      // Refresh assessments
      const a = await listAssessments();
      setAssessments(a);
      setActiveIdx(0); // jump to latest
    } catch (e: any) {
      setError(`AI assessment mislukt: ${e.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const removeCheckIn = async (date: string) => {
    if (!confirm(`Check-in van ${date} verwijderen?`)) return;
    const toDelete = photos.filter((p) => p.check_in_date === date);
    for (const p of toDelete) await deletePhoto(p);
    const fresh = await listPhotos();
    setPhotos(fresh);
  };

  if (loading) {
    return (
      <div className="text-stone-500 text-sm py-8 text-center">Loading...</div>
    );
  }

  if (needsKey) return <NoApiKeyBanner />;

  const currentByAngle = current
    ? Object.fromEntries(current.photos.map((p) => [p.angle, p])) as Record<
        PhotoAngle,
        ProgressPhoto
      >
    : ({} as Record<PhotoAngle, ProgressPhoto>);
  const prevByAngle = previous
    ? Object.fromEntries(previous.photos.map((p) => [p.angle, p])) as Record<
        PhotoAngle,
        ProgressPhoto
      >
    : ({} as Record<PhotoAngle, ProgressPhoto>);

  const activeCurrent = currentByAngle[activeAngle];
  const activePrev = prevByAngle[activeAngle];

  const currentAssessment = current
    ? assessments.find((a) => a.check_in_date === current.date)
    : undefined;

  return (
    <div className="space-y-6">
      {/* UPLOAD CARD */}
      <div className="border border-stone-800 bg-stone-950 rounded-lg p-6">
        <h3 className="text-base font-semibold mb-1">Nieuwe check-in</h3>
        <p className="text-sm text-stone-500 mb-4">
          Upload 3 foto's: voorkant, zijkant, rug. Best 1× per week, in dezelfde
          houding/licht voor goede vergelijking.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-sm text-stone-300 font-medium mb-1.5 block">
              Datum
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-md px-3 py-2.5 text-stone-100 focus:outline-none focus:border-orange-500"
            />
          </div>
          {ANGLES.map((angle) => (
            <div key={angle}>
              <label className="text-sm text-stone-300 font-medium mb-1.5 block">
                {ANGLE_LABEL[angle]}
              </label>
              <label className="flex items-center justify-center gap-2 w-full bg-stone-900 border border-stone-800 rounded-md px-3 py-2.5 text-sm text-stone-400 hover:border-orange-500/50 cursor-pointer">
                <Upload size={14} />
                {files[angle] ? files[angle]!.name.slice(0, 12) : "Kies foto"}
                <input
                  id={`photo-input-${angle}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setFiles((f) => ({
                      ...f,
                      [angle]: e.target.files?.[0] ?? null,
                    }))
                  }
                />
              </label>
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-orange-400 mb-3">{error}</p>}
        <PrimaryButton
          onClick={submit}
          disabled={uploading || analyzing}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          {uploading ? (
            "Uploaden..."
          ) : analyzing ? (
            <>
              <Sparkles size={14} /> AI analyseert...
            </>
          ) : (
            <>
              <Camera size={14} /> Upload + analyseer
            </>
          )}
        </PrimaryButton>
        {false && (
          <p className="text-xs text-stone-500 mt-2">
            Geen Anthropic key — uploads worden bewaard, AI assessment komt later.
          </p>
        )}
      </div>

      {/* CHECK-IN BROWSER */}
      {checkIns.length === 0 ? (
        <div className="border border-stone-800 bg-stone-950 rounded-lg p-12 text-center">
          <Camera size={32} className="text-stone-700 mx-auto mb-3" />
          <p className="text-sm text-stone-500">
            Nog geen check-ins. Upload je eerste foto's hierboven.
          </p>
        </div>
      ) : (
        <>
          {/* Navigator */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() =>
                setActiveIdx((i) => Math.min(checkIns.length - 1, i + 1))
              }
              disabled={activeIdx >= checkIns.length - 1}
              className="p-2 border border-stone-800 rounded-md text-stone-400 hover:border-orange-500/50 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-center">
              <div className="text-sm text-stone-300 font-medium">
                {current?.date}
              </div>
              <div className="text-xs text-stone-500">
                Check-in {checkIns.length - activeIdx} van {checkIns.length}
              </div>
            </div>
            <button
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className="p-2 border border-stone-800 rounded-md text-stone-400 hover:border-orange-500/50 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Angle selector */}
          <div className="flex gap-2 justify-center">
            {ANGLES.map((a) => (
              <button
                key={a}
                onClick={() => setActiveAngle(a)}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  activeAngle === a
                    ? "bg-orange-500 border-orange-500 text-stone-950 font-medium"
                    : "bg-stone-900 border-stone-800 text-stone-300"
                }`}
              >
                {ANGLE_LABEL[a]}
              </button>
            ))}
          </div>

          {/* Compare or single */}
          {activeCurrent && activePrev ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <CompareSlider
                  before={signedUrls[activePrev.storage_path] ?? ""}
                  after={signedUrls[activeCurrent.storage_path] ?? ""}
                  beforeLabel={previous!.date}
                  afterLabel={current!.date}
                  alt={activeAngle}
                />
                <p className="text-xs text-stone-500 mt-2 text-center">
                  Sleep om te vergelijken
                </p>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-stone-500 mb-1">Vorige</div>
                    <img
                      src={signedUrls[activePrev.storage_path]}
                      alt="prev"
                      className="w-full aspect-[3/4] object-cover rounded-md bg-stone-900"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 mb-1">Nu</div>
                    <img
                      src={signedUrls[activeCurrent.storage_path]}
                      alt="now"
                      className="w-full aspect-[3/4] object-cover rounded-md bg-stone-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : activeCurrent ? (
            <div className="max-w-md mx-auto">
              <img
                src={signedUrls[activeCurrent.storage_path]}
                alt="current"
                className="w-full aspect-[3/4] object-cover rounded-md bg-stone-900"
              />
              <p className="text-xs text-stone-500 mt-2 text-center">
                Eerste check-in voor deze hoek — vanaf volgende keer zie je
                vergelijking.
              </p>
            </div>
          ) : (
            <div className="text-center text-sm text-stone-500 py-8">
              Geen foto voor "{ANGLE_LABEL[activeAngle]}" op {current?.date}
            </div>
          )}

          {/* AI assessment */}
          {currentAssessment && (
            <div className="border border-orange-500/40 bg-orange-500/5 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-orange-400" />
                <h4 className="text-sm font-semibold text-stone-100">
                  AI observatie
                </h4>
              </div>
              <p className="text-stone-200 leading-relaxed mb-4">
                {currentAssessment.assessment.summary}
              </p>
              {currentAssessment.assessment.observations?.length > 0 && (
                <>
                  <div className="text-xs text-stone-500 font-medium mb-2">
                    Observaties
                  </div>
                  <ul className="space-y-1 mb-4">
                    {currentAssessment.assessment.observations.map((o, i) => (
                      <li
                        key={i}
                        className="text-sm text-stone-300 leading-relaxed"
                      >
                        • {o}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {currentAssessment.assessment.focus_areas?.length > 0 && (
                <>
                  <div className="text-xs text-stone-500 font-medium mb-2">
                    Focus komende weken
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentAssessment.assessment.focus_areas.map((f, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-stone-900 border border-stone-800 rounded-full text-sm text-stone-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {currentAssessment.assessment.motivation && (
                <p className="text-orange-300 text-sm leading-relaxed border-l-2 border-orange-500 pl-3">
                  {currentAssessment.assessment.motivation}
                </p>
              )}
            </div>
          )}

          {current && (
            <div className="text-center">
              <SecondaryButton
                onClick={() => removeCheckIn(current.date)}
                className="text-sm"
              >
                Verwijder check-in {current.date}
              </SecondaryButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}
