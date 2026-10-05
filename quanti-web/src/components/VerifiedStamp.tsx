import Image from "next/image";

type VerifiedStampProps = {
  className?: string;
  sizeClassName?: string;
};

export default function VerifiedStamp({
  className = "",
  sizeClassName = "h-16 w-16 sm:h-20 sm:w-20",
}: VerifiedStampProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full shadow-[0_0_20px_rgba(124,58,237,0.25)] ${className}`.trim()}
    >
      <Image
        src="/stamp-verified.svg"
        alt="Quanti verified"
        width={80}
        height={80}
        unoptimized
        className={`block ${sizeClassName}`}
      />
    </div>
  );
}
