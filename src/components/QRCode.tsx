"use client";

import { useEffect, useState } from "react";

interface QRCodeProps {
  shortCode: string;
  size?: "sm" | "lg";
}

export default function QRCode({ shortCode, size = "lg" }: QRCodeProps) {
  const [src, setSrc] = useState<string | null>(null);

  const qrUrl = `/api/links/${shortCode}/qr`;

  useEffect(() => {
    fetch(qrUrl)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load QR code");
        return r.blob();
      })
      .then((blob) => setSrc(URL.createObjectURL(blob)))
      .catch(() => setSrc(null));

    return () => {
      if (src) URL.revokeObjectURL(src);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrUrl]);

  if (!src) {
    const px = size === "sm" ? "h-20 w-20" : "h-[200px] w-[200px]";
    return <div className={`${px} bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse`} />;
  }

  if (size === "sm") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="QR code"
        className="h-20 w-20 rounded-xl"
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="QR code"
        className="h-[200px] w-[200px] rounded-xl"
      />
      <a
        href={qrUrl}
        download={`snip-${shortCode}.png`}
        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
      >
        Download QR
      </a>
    </div>
  );
}
