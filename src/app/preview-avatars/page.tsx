const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const photo = (file: string) => `${BASE_PATH}/avatars/${file}`;

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <div className="invitation rounded-[1.75rem] border border-white/80 px-5 py-9 text-center">{children}</div>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */

function Avatar({ name, file }: { name: string; file: string }) {
  return (
    <figure className="flex flex-col items-center gap-2">
      <img
        src={photo(file)}
        alt={name}
        width={160}
        height={160}
        className="h-20 w-20 rounded-full border-[3px] border-white object-cover shadow-[0_14px_30px_-14px_rgba(194,87,107,0.7)] ring-1 ring-rose/25 sm:h-24 sm:w-24"
      />
      <figcaption className="text-xs font-semibold tracking-wide text-muted">{name}</figcaption>
    </figure>
  );
}

function Ring({ name, file }: { name: string; file: string }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="rounded-full bg-[conic-gradient(from_200deg,#e58a99,#f6d7a8,#c2576b,#f5c1c9,#e58a99)] p-[3px] shadow-[0_16px_34px_-16px_rgba(194,87,107,0.8)]">
        <img
          src={photo(file)}
          alt={name}
          width={160}
          height={160}
          className="h-24 w-24 rounded-full border-[3px] border-white object-cover"
        />
      </div>
      <figcaption className="rounded-full border border-line bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-ink">
        {name}
      </figcaption>
    </figure>
  );
}

// A: the current one
function VariantA() {
  return (
    <div className="flex items-start justify-center gap-4 sm:gap-6">
      <Avatar name="Darko" file="darko.jpg" />
      <span className="mt-7 font-serif text-lg font-semibold tracking-[0.2em] text-rose sm:mt-8 sm:text-xl">VS</span>
      <Avatar name="Magdalena" file="magdalena.jpg" />
    </div>
  );
}

// B: bigger avatars that overlap, with a round VS badge in the middle
function VariantB() {
  return (
    <div>
      <div className="flex items-center justify-center">
        <img
          src={photo("darko.jpg")}
          alt="Darko"
          width={160}
          height={160}
          className="relative z-0 h-28 w-28 rounded-full border-4 border-white object-cover shadow-[0_18px_36px_-16px_rgba(194,87,107,0.75)]"
        />
        <span className="relative z-10 -mx-4 grid h-11 w-11 place-items-center rounded-full bg-gradient-to-b from-[#d56b7d] to-[#c2576b] font-serif text-sm font-semibold text-white shadow-[0_10px_22px_-8px_rgba(194,87,107,0.95)] ring-4 ring-white">
          VS
        </span>
        <img
          src={photo("magdalena.jpg")}
          alt="Magdalena"
          width={160}
          height={160}
          className="relative z-0 h-28 w-28 rounded-full border-4 border-white object-cover shadow-[0_18px_36px_-16px_rgba(194,87,107,0.75)]"
        />
      </div>
      <div className="mt-3 flex justify-center gap-24 text-xs font-semibold tracking-wide text-muted">
        <span>Darko</span>
        <span>Magdalena</span>
      </div>
    </div>
  );
}

// C: rose-gold gradient rings, name pills, VS with fine lines on both sides
function VariantC() {
  return (
    <div className="flex items-start justify-center gap-3">
      <Ring name="Darko" file="darko.jpg" />
      <div className="mt-10 flex items-center gap-2">
        <span className="h-px w-5 bg-rose/40" />
        <span className="font-serif text-xl font-semibold tracking-[0.18em] text-rose">VS</span>
        <span className="h-px w-5 bg-rose/40" />
      </div>
      <Ring name="Magdalena" file="magdalena.jpg" />
    </div>
  );
}

// D: avatars at both ends, a line between them with the VS pill in the middle
function VariantD() {
  return (
    <div>
      <div className="mx-auto flex max-w-sm items-center">
        <img
          src={photo("darko.jpg")}
          alt="Darko"
          width={160}
          height={160}
          className="h-[5.5rem] w-[5.5rem] shrink-0 rounded-full border-[3px] border-white object-cover shadow-[0_14px_30px_-14px_rgba(194,87,107,0.7)] ring-2 ring-rose/30"
        />
        <div className="relative mx-3 flex flex-1 items-center">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-rose/50 to-rose/50" />
          <span className="mx-2 rounded-full border border-line bg-white px-3 py-1 font-serif text-sm font-semibold tracking-[0.18em] text-rose shadow-sm">
            VS
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-rose/50 to-rose/50" />
        </div>
        <img
          src={photo("magdalena.jpg")}
          alt="Magdalena"
          width={160}
          height={160}
          className="h-[5.5rem] w-[5.5rem] shrink-0 rounded-full border-[3px] border-white object-cover shadow-[0_14px_30px_-14px_rgba(194,87,107,0.7)] ring-2 ring-rose/30"
        />
      </div>
      <div className="mx-auto mt-3 flex max-w-sm justify-between px-1 text-xs font-semibold tracking-wide text-muted">
        <span className="w-[5.5rem] text-center">Darko</span>
        <span className="w-[5.5rem] text-center">Magdalena</span>
      </div>
    </div>
  );
}

export default function PreviewAvatars() {
  return (
    <main className="mx-auto flex max-w-[32rem] flex-col gap-8 px-4 py-10">
      <Card label="A · trenutna">
        <VariantA />
      </Card>
      <Card label="B · preklopljeni, okrugli VS">
        <VariantB />
      </Card>
      <Card label="C · zlatno-roze prstenovi">
        <VariantC />
      </Card>
      <Card label="D · linija izmedju, VS na sredini">
        <VariantD />
      </Card>
    </main>
  );
}
