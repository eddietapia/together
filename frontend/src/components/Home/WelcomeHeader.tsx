import logoIcon from "@/assets/Biomni Lab Logo Icon.png";

export function WelcomeHeader() {
  return (
    <header className="relative z-10 flex-shrink-0 bg-[#faf7f0] border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <img
          src={logoIcon}
          alt=""
          className="h-8 w-8 flex-shrink-0 object-contain"
          draggable={false}
        />
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-foreground leading-tight">
            Hi, Eddie!
          </h1>
          <p className="text-xs text-muted-foreground leading-snug">
            Help me take down this virus by reviewing the submissions I made for
            you.
            <br />
            Merging changes makes the virus weaker! When there are no more
            submissions to review, we'll get rid of the virus.
          </p>
        </div>
      </div>
    </header>
  );
}
