import type { Metadata } from "next";
import { ProcessArgumentForm } from "@/components/ProcessArgumentForm";

export const metadata: Metadata = {
  title: "Process an argument",
};

export default function ArgumentsPage() {
  return (
    <div className="page">
      <header className="page-header">
        <p className="pill">Inside Black Boxes</p>
        <h1>Process an argument</h1>
        <p className="lede">
          Pulls the Court’s recording and transcript, times the words, and writes a
          draft Listen page with Friction. It runs on this computer. Timing is billed
          by the minute on your OpenAI key. The notes are one chat call on that same
          key. The public site only plays the result.
        </p>
      </header>
      <ProcessArgumentForm />
    </div>
  );
}
