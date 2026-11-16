import Image from "next/image";

interface ProfileHeaderProps {
  name: string;
  subtitle: string;
  avatarSrc: string;
}

// Figma client profile heading: round avatar, name, application line.
export function ProfileHeader({ name, subtitle, avatarSrc }: ProfileHeaderProps) {
  return (
    <header className="flex items-center gap-4">
      <Image
        src={avatarSrc}
        alt=""
        width={83}
        height={83}
        className="size-[83px] shrink-0 rounded-full object-cover"
      />
      <div className="flex flex-col gap-1">
        <h1 className="text-[32px] font-bold leading-10 text-foreground">{name}</h1>
        <p className="text-sm text-foreground">{subtitle}</p>
      </div>
    </header>
  );
}
