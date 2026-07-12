import Image from "next/image";
import Link from "next/link";
import { LandingBinary } from "@/components/LandingBinary";

export function LandingPage() {
  return (
    <main className="landing">
      <div className="landing__scene" aria-hidden="true">
        <Image
          src="/landing-hero.png"
          alt=""
          fill
          priority
          className="landing__image"
          sizes="100vw"
        />
        <div className="landing__scrim" />
        <LandingBinary />
      </div>

      <div className="landing__content">
        <p className="landing__brand">Blackletter Lab</p>
        <p className="landing__tagline">Your private legaltech idea lab.</p>

        <nav className="landing__ctas" aria-label="Enter">
          <Link href="/library" className="landing__cta">
            Library
          </Link>
          <Link href="/capture" className="landing__cta">
            Capture
          </Link>
          <Link href="/ratiocinate" className="landing__cta">
            Ratiocinate
          </Link>
        </nav>
      </div>
    </main>
  );
}
