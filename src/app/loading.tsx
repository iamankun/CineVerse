import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/logo.gif"
          alt="CineVerse đang tải..."
          width={150}
          height={150}
          priority
          unoptimized
        />
      </div>
    </div>
  );
}
