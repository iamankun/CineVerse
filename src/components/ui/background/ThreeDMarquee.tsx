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
    <div {...props} className={cn("mx-auto block size-full overflow-hidden", className)}>
      <div className="flex size-full items-center justify-center">
        <div className="size-[1400px] shrink-0 -translate-x-32 scale-75 md:scale-100">
          <div
            className="relative right-[50%] top-96 grid size-full origin-top-left grid-cols-4 gap-8"
            style={{
              transform: "rotateX(55deg) rotateY(0deg) rotateZ(-45deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {chunks.map((subarray, colIndex) => (
              <motion.div
                key={colIndex + "marquee"}
                className="flex flex-col items-start gap-8"
                animate={{ y: colIndex % 2 === 0 ? 500 : -500 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: colIndex % 2 === 0 ? 10 : 15,
                }}
              >
                {subarray.map((image, imageIndex) => (
                  <div className="relative" key={imageIndex + image}>
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
                        "rounded-lg object-cover hover:shadow-2xl",
                        {
                          "aspect-video": aspect === "video",
                          "aspect-2/3": aspect === "poster",
                        },
                      )}
                    />
                  </div>
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
