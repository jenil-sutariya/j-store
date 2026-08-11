"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { JewelryHero } from "@/components/storefront/jewelry-hero";
import { ArrowLink } from "@/components/storefront/editorial/arrow-link";

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

  // Raw scroll progress updates once per scroll event, which reads as
  // slightly mechanical/stepped when driving a transform directly. Running
  // it through a spring smooths that into a continuous, inertia-like motion
  // — this is what actually makes the grow/fade feel "smooth" rather than
  // just correct.
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 55, damping: 26, mass: 0.5 });

  const contentOpacity = useTransform(smoothProgress, [0, 0.7], [1, 0]);
  const contentScale = useTransform(smoothProgress, [0, 1], [1, 0.94]);
  const sceneOpacity = useTransform(smoothProgress, [0, 0.6, 1], [1, 1, 0]);

  // The "zoom" used to be a CSS `scale()` on the whole scene div. That scales
  // a flat rendered image around its own center — but the diamonds sit at
  // different x/z offsets in 3D space, so blowing up that image amplifies
  // how off-center they are instead of feeling like zooming into the scene.
  // A real dolly (moving the 3D camera closer) stays centered on the
  // viewport by construction, and reads as an actual zoom rather than an
  // image stretch. useFrame inside the Canvas reads this ref every frame —
  // passed as a ref, not state, so scrolling doesn't re-render the R3F tree.
  const scrollProgressRef = useRef(0);
  useMotionValueEvent(smoothProgress, "change", (value) => {
    scrollProgressRef.current = value;
  });

  return (
    <section ref={sectionRef} className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <motion.div style={{ opacity: sceneOpacity }} className="absolute inset-0">
        <JewelryHero scrollProgressRef={scrollProgressRef} />
      </motion.div>

      <motion.div
        style={{ opacity: contentOpacity, scale: contentScale }}
        className="relative flex flex-col items-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs tracking-[0.3em] text-muted-foreground uppercase"
        >
          Aurelia — Est. Fine Jewellery
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="royal-divider mt-4 mb-6"
          aria-hidden
        >
          <span className="royal-divider-dot" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-display max-w-3xl text-[clamp(2.5rem,11vw,6.5rem)] leading-[1.05] tracking-tight"
        >
          Jewellery, crafted to become forever.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 max-w-md text-sm text-muted-foreground"
        >
          Each piece is designed to outlast trend, season, and occasion — made once, worn always.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10"
        >
          <ArrowLink href="/collections">Explore Collection</ArrowLink>
        </motion.div>
      </motion.div>

      <Link
        href="#story"
        data-cursor-hover
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Scroll</span>
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="h-10 w-px bg-foreground/40"
        />
      </Link>
    </section>
  );
}
