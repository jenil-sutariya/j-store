"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function CollectionBanner({
  bannerUrl,
  name,
  tagline,
}: {
  bannerUrl: string;
  name: string;
  tagline: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.3, 0.6]);

  return (
    <div ref={containerRef} className="relative h-64 w-full overflow-hidden sm:h-96">
      <motion.div style={{ y: imageY }} className="absolute inset-0 h-[130%]">
        <Image src={bannerUrl} alt={name} fill className="object-cover" priority />
      </motion.div>
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-black"
      />
      <div className="relative flex h-full flex-col items-center justify-center text-center text-white">
        <h1 className="text-3xl font-semibold">{name}</h1>
        {tagline && <p className="mt-1">{tagline}</p>}
      </div>
    </div>
  );
}

export function CollectionStoryText({ content }: { content: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const animation = gsap.fromTo(
      ref.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
        },
      },
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, []);

  return (
    <p ref={ref} className="mb-8 max-w-2xl text-muted-foreground">
      {content}
    </p>
  );
}
