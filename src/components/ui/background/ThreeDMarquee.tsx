// https://ui.aceternity.com/components/3d-marquee

"use client";

import { cn } from "@/utils/helpers";
import { motion } from "framer-motion";

export interface ThreeDMarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[];
  aspect?: "video" | "poster";
}

const ThreeDMarquee: React.FC<ThreeDMarqueeProps> = ({ images, className, aspect, ...props }) => {
  const chunkSize = Math.ceil(images.length / 4);
  const chunks = Array.from({ length: 4 }, (_, colIndex) => {
    const start = colIndex * chunkSize;
    return images.slice(start, start + chunkSize);
  });

  return (
    <div {...props} className={cn("mx-auto block size-full overflow-hidden pointer-events-none", className)}>
      <div className="flex size-full items-center justify-center overflow-hidden">
        <div className="w-full max-w-[1400px] h-[1400px] shrink-0 -translate-x-16 md:-translate-x-32 scale-[0.6] sm:scale-[0.65] md:scale-75 lg:scale-100">
          <div
            className="relative right-[50%] top-96 grid size-full origin-top-left grid-cols-4 gap-12"
            style={{
              transform: "rotateX(55deg) rotateY(0deg) rotateZ(-45deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {chunks.map((subarray, colIndex) => (
              <motion.div
                key={colIndex + "marquee"}
                className="flex flex-col items-start gap-12"
                animate={{ y: colIndex % 2 === 0 ? 500 : -500 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: colIndex % 2 === 0 ? 10 : 15,
                }}
              >
                {subarray.map((image, imageIndex) => (
                  <motion.img
                    src={image}
                    key={imageIndex + image}
                    alt={`Image ${imageIndex + 1}`}
                    width={aspect === "video" ? 970 : 600}
                    height={aspect === "video" ? 700 : 400}
                    whileHover={{
                      y: -40,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                    className={cn(
                      "rounded-lg object-cover hover:shadow-2xl mb-6",
                      {
                        "aspect-video": aspect === "video",
                        "aspect-2/3": aspect === "poster",
                      },
                    )}
                  />
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDMarquee;
