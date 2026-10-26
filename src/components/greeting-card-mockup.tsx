type GreetingCardMockupProps = {
  src: string;
  alt: string;
  /** Small variant for grid thumbnails; default is detail-page size. */
  size?: "sm" | "lg";
};

/**
 * Renders a design image as a physical greeting card: slight 3D tilt,
 * a shadow at the base, and a fold shadow on the left spine so it reads
 * as a tangible card rather than flat art.
 */
export function GreetingCardMockup({
  src,
  alt,
  size = "lg",
}: GreetingCardMockupProps) {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="relative"
        style={{
          perspective: "1600px",
        }}
      >
        <div
          className="relative overflow-hidden rounded-r-md rounded-l-sm bg-white"
          style={{
            transform: "rotateY(-6deg)",
            transformOrigin: "left center",
            boxShadow:
              "0 20px 40px rgba(26,31,54,0.18), 0 8px 20px rgba(26,31,54,0.10), 0 1px 2px rgba(26,31,54,0.08)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={
              size === "sm" ? "block h-auto w-full" : "block h-auto w-full"
            }
          />
          {/* Fold shadow on the left spine */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-4"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.22), rgba(0,0,0,0))",
            }}
          />
          {/* Thin highlight along the right edge */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-px bg-black/5"
          />
          {/* Subtle paper grain shadow at the bottom */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.08), rgba(0,0,0,0))",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export { isGreetingCardProduct } from "@/lib/shop-physical";
