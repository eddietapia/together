import companionImg from '@/assets/white-blood-cell-with-anti-virus-sign.png';

export function CompanionAvatar({
  alt,
  className,
}: {
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={companionImg}
      alt={alt}
      className={className}
      draggable={false}
    />
  );
}
