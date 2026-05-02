type BrandLogoProps = {
  className?: string;
  alt?: string;
};

export default function BrandLogo({ className = "w-9 h-9", alt = "AcadNest brand logo" }: BrandLogoProps) {
  return (
    <img src="/favicon.svg" alt={alt} className={className} draggable={false} />
  );
}
