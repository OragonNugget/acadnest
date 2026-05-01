type BrandLogoProps = {
  className?: string;
  alt?: string;
};

export default function BrandLogo({ className = "w-9 h-9", alt = "AcadNest brand logo" }: BrandLogoProps) {
  // Use favicon.svg as the always-available source, but support favicon.png if you drop it into `public/`.
  return (
    <picture>
      <source srcSet="/favicon.png" type="image/png" />
      <img src="/favicon.svg" alt={alt} className={className} draggable={false} />
    </picture>
  );
}

