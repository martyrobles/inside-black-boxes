import type { Metadata } from "next";
import { CaptureForm } from "@/components/CaptureForm";

export const metadata: Metadata = {
  title: "Capture",
};

export default function CapturePage() {
  return (
    <div className="page page--narrow">
      <header className="page-header">
        <p className="pill">Capture</p>
        <h1>Save it before you know what it is</h1>
        <p className="lede">
          Add a note, image, document, or URL. A one-sentence description is
          enough — or say you are not sure yet.
        </p>
      </header>
      <CaptureForm />
    </div>
  );
}
