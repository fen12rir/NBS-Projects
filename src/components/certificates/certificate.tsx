

import { QRCodeSVG } from "qrcode.react";

interface CertificateProps {
  name: string;
  completionDate: string;
  certificateId: string;
}



export function Certificate({
  name,
  completionDate,
  certificateId,
}: CertificateProps) {
  return (
    <div
      className="relative mx-auto w-full max-w-[1086px] overflow-hidden bg-white shadow-lg"
      style={{ aspectRatio: "1086 / 752" }}
    >
      <img
        src="/assets/modules/certificate/Certificate_Template.png"
        alt="Cashier Training Course certificate template"
        crossOrigin="anonymous"
        className="absolute inset-0 h-full w-full object-contain"
      />

      <div
        className="absolute left-[5%] top-[49%] w-[90%] -translate-y-1/2 px-4 text-center text-[clamp(1.25rem,3vw,2.75rem)] font-bold text-[#800000]"
      >
        {name}
      </div>

      <div
        data-certificate-date
        className="absolute left-[10.5%] top-[60.5%] flex h-[8%] w-[85%] items-center justify-center text-center text-[clamp(0.875rem,1.8vw,1.25rem)] text-gray-900"
      >
        {completionDate}
      </div>

      <div
        data-certificate-id
        className="absolute bottom-[5%] left-0 w-full text-center font-mono text-[clamp(0.5rem,0.8vw,0.75rem)] text-gray-700"
      >
        Certificate ID: {certificateId}
      </div>

      <div className="absolute bottom-[8%] right-[8%] bg-white p-2">
      <QRCodeSVG value={certificateId} size={100} level="M" />
      </div>
    </div>
  );
}
