import QRCode from "qrcode";
import qrcodeTerminal from "qrcode-terminal";

export function printQrTerminal(text: string): Promise<void> {
  return new Promise((resolve) => {
    qrcodeTerminal.generate(text, { small: true }, (qr: string) => {
      console.log(qr);
      resolve();
    });
  });
}

export async function saveQrImage(text: string, filePath: string): Promise<string> {
  await QRCode.toFile(filePath, text, { width: 300, margin: 2 });
  return filePath;
}

export async function getQrBase64(text: string): Promise<string> {
  return QRCode.toDataURL(text);
}
