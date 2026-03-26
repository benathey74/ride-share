import type { ReactNode } from "react";

type PassengerHomeHeroBannerProps = {
  /** Headline / top-aligned content (sky area). */
  top?: ReactNode;
  /** Subcopy / bottom-aligned content. */
  bottom?: ReactNode;
  /** Single block pinned to the bottom (e.g. onboarding hero). Ignored if `top` or `bottom` is set. */
  children?: ReactNode;
  /** Stack `children` only at the top of the banner (overrides top/bottom split). */
  verticallyCenter?: boolean;
};

/**
 * Full-width hero: full-bleed illustration only. Asset: `public/images/passenger-home-hero.png`.
 * Use `verticallyCenter` with grouped children (top-aligned stack), `top` + `bottom` for split layout, or `children` alone for bottom-pinned onboarding.
 */
export function PassengerHomeHeroBanner({
  top,
  bottom,
  children,
  verticallyCenter = false,
}: PassengerHomeHeroBannerProps) {
  const split = !verticallyCenter && (top != null || bottom != null);

  const justify = verticallyCenter ? "justify-start items-start" : split ? "justify-between" : "justify-end";

  return (
    <section className="relative isolate flex aspect-[1024/682] min-h-[13rem] w-full flex-col overflow-hidden rounded-[2rem] bg-muted/30 shadow-soft-lg md:min-h-[15rem]">
      <img
        src="/images/passenger-home-hero.png"
        alt=""
        width={1024}
        height={682}
        decoding="async"
        className="pointer-events-none absolute inset-y-0 -left-[10px] h-full w-[calc(100%+10px)] max-w-none translate-x-[10px] object-cover object-[center_right] sm:object-center"
        aria-hidden
      />
      <div className={`relative z-10 flex min-h-0 w-full flex-1 flex-col p-6 ${justify}`}>
        {verticallyCenter ? (
          <div className="shrink-0">{children}</div>
        ) : split ? (
          <>
            <div className="shrink-0">{top}</div>
            <div className="shrink-0">{bottom}</div>
          </>
        ) : (
          <div className="shrink-0">{children}</div>
        )}
      </div>
    </section>
  );
}
