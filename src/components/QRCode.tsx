"use client";

import { useEffect, useRef, useState } from "react";

interface QRCodeProps {
  shortCode: string;
  size?: "sm" | "lg";
}

const SIZE_CLASS = {
  sm: "h-20 w-20",
  lg: "h-[200px] w-[200px]",
};

export default function QRCode({ shortCode, size = "lg" }: QRCodeProps) {
  const [src, setSrc] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const qrUrl = `/api/links/${shortCode}/qr`;

  useEffect(() => {
    fetch(qrUrl)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load QR code");
        return r.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setSrc(url);
      })
      .catch(() => setSrc(null));

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [qrUrl]);

  if (!src) {
    return <div className={`${SIZE_CLASS[size]} bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse`} />;
  }

  return (
    <div className={size === "lg" ? "flex flex-col items-center gap-3" : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="QR code" className={`${SIZE_CLASS[size]} rounded-xl`} />
      {size === "lg" && (
        <a
          href={qrUrl}
          download={`snip-${shortCode}.png`}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
        >
          Download QR
        </a>
      )}
    </div>
  );
}
