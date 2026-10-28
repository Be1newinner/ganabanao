import { Logo } from "@/components/brand";
import { CoverArt } from "@/components/cover-art";
import { ThemeToggle } from "@/components/theme";

const WALL = ["holi", "kajri", "chaita", "bhajan", "biraha", "sohar", "jhumar", "purbi", "nirgun"];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>

      {/* Art panel: an album wall of generated covers */}
      <div className="relative hidden overflow-hidden bg-muted lg:block">
        <div className="absolute inset-0 grid -rotate-6 scale-125 grid-cols-3 gap-4 p-4 opacity-90">
          {WALL.map((seed) => (
            <CoverArt key={seed} seed={seed} className="aspect-square w-full" rounded="rounded-3xl" />
          ))}
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-x-10 bottom-12 text-white">
          <p className="font-display text-4xl font-bold leading-tight">Write the words.<br />Hear the song.</p>
          <p className="mt-3 max-w-md text-white/75">Bhojpuri songs with vocals, dholak and harmonium, made by AI in minutes.</p>
        </div>
      </div>
    </div>
  );
}
