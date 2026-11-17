import Image from "next/image";

interface ProfileHeaderProps {
  name: string;
  subtitle: string;
  // Without a photo the client's initials are shown instead.
  avatarSrc?: string;
}

// Figma client profile heading: round avatar, name, application line.
export function ProfileHeader({ name, subtitle, avatarSrc }: ProfileHeaderProps) {
  return (
    <header className="flex items-center gap-4">
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt=""
          width={83}
          height={83}
          className="size-[83px] shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-[83px] shrink-0 items-center justify-center rounded-full bg-lime-soft text-2xl font-semibold text-navy"
        >
          {name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <h1 className="text-[32px] font-bold leading-10 text-foreground">{name}</h1>
        <p className="text-sm text-foreground">{subtitle}</p>
      </div>
    </header>
  );
}
