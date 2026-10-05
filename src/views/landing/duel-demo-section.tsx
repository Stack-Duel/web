"use client";

import { useState } from "react";
import Image from "next/image";
import { BrowserMockup } from "@/shared/components/ui/browser-mockup";

const DUEL_DEMO_ALT =
  "A live Algowars duel: two players racing to solve the same coding problem, judged instantly";

export default function DuelDemoSection() {
  const [videoDisabled, setVideoDisabled] = useState(false);

  return (
    <section className="px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        <BrowserMockup>
          {videoDisabled ? (
            <Image
              src="/Demos/duel-demo.png"
              alt={DUEL_DEMO_ALT}
              width={1901}
              height={1020}
              className="h-auto w-full"
              priority
            />
          ) : (
            <video
              className="h-auto w-full"
              poster="/Demos/duel-demo.png"
              aria-label={DUEL_DEMO_ALT}
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoDisabled(true)}
            >
              <source src="/Demos/duel-demo-video.mp4" type="video/mp4" />
            </video>
          )}
        </BrowserMockup>
      </div>
    </section>
  );
}
