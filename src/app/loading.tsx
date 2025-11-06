import BrandLogo from "@/components/ui/other/BrandLogo";
import SpaceBackground from "@/components/ui/other/SpaceBackground";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <SpaceBackground />
      <div className="logo-container flex flex-col items-center gap-6">
        <div className="scale-[1.875]">
          <BrandLogo animate={true} />
        </div>
      </div>
    </div>
  );
}
