import QRCode from "qrcode";

const QR_OPTIONS = {
  type: "png" as const,
  width: 400,
  margin: 2,
  color: { dark: "#000000", light: "#ffffff" },
};

export async function generateQRCode(shortUrl: string): Promise<Buffer> {
  return QRCode.toBuffer(shortUrl, QR_OPTIONS);
}
