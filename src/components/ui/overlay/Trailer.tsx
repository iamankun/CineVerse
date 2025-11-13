import IconButton from "@/components/ui/button/IconButton";
import { useCustomCarousel } from "@/hooks/useCustomCarousel";
import { cn, isEmpty } from "@/utils/helpers";
import { useDisclosure } from "@mantine/hooks";
import { Button, Modal, ModalBody, ModalContent, Skeleton, Tooltip } from "@heroui/react";
import clsx from "clsx";
import { Video } from "tmdb-ts/dist/types/credits";
import { Youtube } from "@/utils/icons";
import { colors, ColorType } from "@/types/component";

interface TrailerProps {
  videos: Video[];
  color?: ColorType;
}

const Trailer: React.FC<TrailerProps> = ({ videos, color = "primary" }) => {
  const [opened, handlers] = useDisclosure(false);
  const c = useCustomCarousel();
  
  // Lọc trailers YouTube
  const youtubeTrailers = videos.filter(
    (trailer) => trailer.site === "YouTube" && trailer.type === "Trailer",
  );

  // Ưu tiên trailer tiếng Việt trước, sau đó tiếng Anh, cuối cùng là ngôn ngữ khác
  const sortedTrailers = youtubeTrailers.sort((a, b) => {
    const getPriority = (lang: string | undefined) => {
      if (lang === 'vi') return 1;
      if (lang === 'en') return 2;
      return 3; // Các ngôn ngữ khác có priority thấp hơn nhưng vẫn được hiển thị
    };
    
    const aPriority = getPriority(a.iso_639_1 || undefined);
    const bPriority = getPriority(b.iso_639_1 || undefined);
    return aPriority - bPriority;
  });

  const trailers = sortedTrailers;
  const multiple = trailers.length > 1;

  const handleClose = () => {
    handlers.close();
    c.scrollTo(0);
  };

  // Nếu không có trailer, không hiển thị gì
  if (isEmpty(trailers)) {
    return null;
  }

  return (
      <>
        <Button
          color="danger"
          variant="shadow"
          startContent={<Youtube size={22} />}
          onPress={() => handlers.open()}
        >
          Xem giới thiệu
        </Button>

        <Modal backdrop="blur" size="5xl" isOpen={opened} onClose={handleClose} placement="center">
          <ModalContent>
            <ModalBody className="p-3 md:p-8">
              <div className="embla flex flex-col justify-center gap-5">
                {multiple && (
                  <>
                    <div className={clsx("absolute z-10 md:-translate-x-5")}>
                      <IconButton
                        isDisabled={!c.canScrollPrev}
                        onPress={c.scrollPrev}
                        size="sm"
                        radius="full"
                        icon="mingcute:left-fill"
                        tooltip="Previous"
                      />
                    </div>
                    <div className={clsx("absolute z-10 place-self-end md:translate-x-5")}>
                      <IconButton
                        isDisabled={!c.canScrollNext}
                        onPress={c.scrollNext}
                        size="sm"
                        radius="full"
                        icon="mingcute:right-fill"
                        tooltip="Next"
                      />
                    </div>
                  </>
                )}
                <div className="embla__viewport" ref={c.emblaRef}>
                  <div className="embla__container gap-2">
                    {trailers.map((trailer, index) => {
                      const inView = index === c.selectedIndex;
                      return (
                        <div
                          key={trailer.key}
                          className="embla__slide flex aspect-video size-full items-center rounded-large px-1 py-2"
                        >
                          <Skeleton className="size-full rounded-large" />
                          {inView && (
                            <iframe
                              className="absolute z-10 size-full rounded-large"
                              src={`https://www.youtube.com/embed/${trailer.key}`}
                              title={trailer.name}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {multiple && (
                <div className="embla__dots inline-flex justify-center gap-2">
                  {trailers.map((trailer, index) => {
                    const inView = index === c.selectedIndex;
                    return (
                      <Tooltip
                        key={trailer.key}
                        content={trailer.name}
                        isDisabled={inView}
                        showArrow
                      >
                        <button
                          onClick={() => c.scrollTo(index)}
                          className={cn("size-2 rounded-full bg-foreground transition-all", {
                            [`w-6 ${colors({ color })}`]: inView,
                          })}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
};

export default Trailer;
