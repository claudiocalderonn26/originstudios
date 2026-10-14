import Image from "next/image";

export function OriginLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo-origin.jpeg"
        width={128}
        height={128}
        sizes={compact ? "44px" : "64px"}
        alt="Origin Studios"
        className={`${compact ? "h-11 w-11" : "h-16 w-16"} rounded-full object-cover ring-1 ring-wine/25`}
      />
      {!compact ? (
        <div className="leading-none">
          <p className="font-sans text-[11px] font-bold uppercase text-wine">Origin</p>
          <p className="font-editorial text-2xl text-ink">Studios</p>
        </div>
      ) : null}
    </div>
  );
}
