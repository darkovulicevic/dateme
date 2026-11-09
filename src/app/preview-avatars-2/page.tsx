/* eslint-disable @next/next/no-img-element */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const photo = (file: string) => `${BASE_PATH}/avatars/${file}`;

function Photo({ file, name, className }: { file: string; name: string; className: string }) {
  return <img src={photo(file)} alt={name} width={160} height={160} className={`rounded-full object-cover ${className}`} />;
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <div className="invitation overflow-hidden rounded-[1.75rem] border border-white/80 px-5 py-9 text-center">{children}</div>
    </div>
  );
}

/* E · "Round one" caption, serif names, italic vs */
function VariantE() {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold tracking-[0.34em] text-muted uppercase">Round one</p>
      <div className="mt-5 flex items-center justify-center gap-5">
        <figure className="flex flex-col items-center gap-2">
          <Photo file="darko.jpg" name="Darko" className="h-24 w-24 border-4 border-white shadow-[0_16px_34px_-16px_rgba(143,61,78,0.7)]" />
          <figcaption className="font-serif text-lg text-ink">Darko</figcaption>
        </figure>
        <span className="-mt-7 font-serif text-3xl text-rose italic">vs</span>
        <figure className="flex flex-col items-center gap-2">
          <Photo file="magdalena.jpg" name="Magdalena" className="h-24 w-24 border-4 border-white shadow-[0_16px_34px_-16px_rgba(143,61,78,0.7)]" />
          <figcaption className="font-serif text-lg text-ink">Magdalena</figcaption>
        </figure>
      </div>
    </div>
  );
}

/* F · dark pill with gold VS */
function VariantF() {
  return (
    <div>
      <div className="mx-auto flex max-w-[17rem] items-center justify-between rounded-full bg-gradient-to-b from-[#563a42] to-ink p-2 shadow-[0_20px_40px_-20px_rgba(63,42,48,0.9)]">
        <Photo file="darko.jpg" name="Darko" className="h-[4.5rem] w-[4.5rem] border-2 border-[#f6d7a8]" />
        <span className="font-serif text-xl font-semibold tracking-[0.2em] text-[#f6d7a8]">VS</span>
        <Photo file="magdalena.jpg" name="Magdalena" className="h-[4.5rem] w-[4.5rem] border-2 border-[#f6d7a8]" />
      </div>
      <div className="mx-auto mt-3 flex max-w-[17rem] justify-between px-2 text-xs font-semibold tracking-wide text-muted">
        <span className="w-[4.5rem] text-center">Darko</span>
        <span className="w-[4.5rem] text-center">Magdalena</span>
      </div>
    </div>
  );
}

/* G · diagonal composition */
function VariantG() {
  return (
    <div className="relative mx-auto h-[11.5rem] max-w-[20rem]">
      <figure className="absolute top-0 left-[6%] flex flex-col items-center gap-1.5">
        <Photo file="darko.jpg" name="Darko" className="h-[5.5rem] w-[5.5rem] border-[3px] border-white shadow-[0_16px_32px_-14px_rgba(194,87,107,0.75)]" />
        <figcaption className="text-xs font-semibold tracking-wide text-muted">Darko</figcaption>
      </figure>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 font-serif text-2xl font-semibold tracking-[0.15em] text-rose">
        VS
      </span>
      <figure className="absolute right-[6%] bottom-0 flex flex-col items-center gap-1.5">
        <Photo file="magdalena.jpg" name="Magdalena" className="h-[5.5rem] w-[5.5rem] border-[3px] border-white shadow-[0_16px_32px_-14px_rgba(194,87,107,0.75)]" />
        <figcaption className="text-xs font-semibold tracking-wide text-muted">Magdalena</figcaption>
      </figure>
    </div>
  );
}

/* H · pulsing rings, rose vs gold */
function VariantH() {
  return (
    <div className="flex items-start justify-center gap-5">
      <figure className="flex flex-col items-center gap-3">
        <div className="relative">
          <span className="ring-pulse absolute inset-0 rounded-full border-2 border-rose/50" />
          <Photo file="darko.jpg" name="Darko" className="relative h-24 w-24 border-4 border-white shadow-[0_16px_34px_-16px_rgba(194,87,107,0.8)]" />
        </div>
        <figcaption className="text-xs font-semibold tracking-wide text-muted">Darko</figcaption>
      </figure>
      <span className="mt-9 font-serif text-xl font-semibold tracking-[0.2em] text-rose">VS</span>
      <figure className="flex flex-col items-center gap-3">
        <div className="relative">
          <span className="ring-pulse absolute inset-0 rounded-full border-2 border-[#e0b270]/70 [animation-delay:1.2s]" />
          <Photo file="magdalena.jpg" name="Magdalena" className="relative h-24 w-24 border-4 border-white shadow-[0_16px_34px_-16px_rgba(224,178,112,0.9)]" />
        </div>
        <figcaption className="text-xs font-semibold tracking-wide text-muted">Magdalena</figcaption>
      </figure>
    </div>
  );
}

/* I · slowly rotating dashed VS, coloured name ribbons */
function VariantI() {
  return (
    <div className="flex items-start justify-center gap-3">
      <figure className="flex flex-col items-center gap-3">
        <Photo file="darko.jpg" name="Darko" className="h-24 w-24 border-4 border-white shadow-[0_16px_34px_-16px_rgba(63,42,48,0.7)]" />
        <figcaption className="rounded-full bg-ink px-4 py-1 text-xs font-semibold tracking-wide text-white">Darko</figcaption>
      </figure>
      <div className="relative mt-[1.6rem] grid h-[3.25rem] w-[3.25rem] place-items-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-rose/60 [animation-duration:14s]" />
        <span className="font-serif text-sm font-semibold tracking-[0.15em] text-rose">VS</span>
      </div>
      <figure className="flex flex-col items-center gap-3">
        <Photo file="magdalena.jpg" name="Magdalena" className="h-24 w-24 border-4 border-white shadow-[0_16px_34px_-16px_rgba(194,87,107,0.8)]" />
        <figcaption className="rounded-full bg-rose px-4 py-1 text-xs font-semibold tracking-wide text-white">Magdalena</figcaption>
      </figure>
    </div>
  );
}

/* J · stickers, slightly tilted */
function VariantJ() {
  return (
    <div className="flex items-center justify-center gap-3">
      <Photo file="darko.jpg" name="Darko" className="h-[6.25rem] w-[6.25rem] -rotate-6 border-[6px] border-white shadow-[0_18px_30px_-12px_rgba(63,42,48,0.45)] ring-1 ring-black/5" />
      <span className="font-serif text-3xl text-rose italic">vs</span>
      <Photo file="magdalena.jpg" name="Magdalena" className="mt-4 h-[6.25rem] w-[6.25rem] rotate-6 border-[6px] border-white shadow-[0_18px_30px_-12px_rgba(63,42,48,0.45)] ring-1 ring-black/5" />
    </div>
  );
}

/* K · compact single-row pill */
function VariantK() {
  return (
    <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-line bg-white/85 p-1.5 shadow-[0_12px_28px_-18px_rgba(194,87,107,0.8)]">
      <Photo file="darko.jpg" name="Darko" className="h-12 w-12 border-2 border-white" />
      <span className="text-sm font-semibold text-ink">Darko</span>
      <span className="font-serif text-sm text-rose italic">vs</span>
      <span className="text-sm font-semibold text-ink">Magdalena</span>
      <Photo file="magdalena.jpg" name="Magdalena" className="h-12 w-12 border-2 border-white" />
    </div>
  );
}

/* L · soft glows behind each avatar, outlined VS */
function VariantL() {
  return (
    <div className="relative flex items-center justify-center gap-1">
      <div className="relative">
        <span className="absolute top-1/2 left-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose/35 blur-2xl" />
        <Photo file="darko.jpg" name="Darko" className="relative h-[6.25rem] w-[6.25rem] border-4 border-white" />
      </div>
      <span className="font-serif text-5xl font-bold text-transparent [-webkit-text-stroke:1.5px_#c2576b]">VS</span>
      <div className="relative">
        <span className="absolute top-1/2 left-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f0c27a]/45 blur-2xl" />
        <Photo file="magdalena.jpg" name="Magdalena" className="relative h-[6.25rem] w-[6.25rem] border-4 border-white" />
      </div>
    </div>
  );
}

/* M · dotted arc between the two with VS at the top */
function VariantM() {
  return (
    <div className="mx-auto w-full max-w-[19rem]">
      <div className="relative">
        <svg viewBox="0 0 300 60" className="block w-full" fill="none" aria-hidden="true">
          <path d="M 52 58 Q 150 -32 248 58" stroke="#c2576b" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0.5 7" />
        </svg>
        <span className="absolute top-[0.1rem] left-1/2 -translate-x-1/2 rounded-full border border-line bg-white px-3 py-0.5 font-serif text-sm font-semibold tracking-[0.18em] text-rose shadow-sm">
          VS
        </span>
      </div>
      <div className="flex justify-between px-1">
        <figure className="flex w-[5.5rem] flex-col items-center gap-2">
          <Photo file="darko.jpg" name="Darko" className="h-[5.5rem] w-[5.5rem] border-[3px] border-white shadow-[0_14px_30px_-14px_rgba(194,87,107,0.7)]" />
          <figcaption className="text-xs font-semibold tracking-wide text-muted">Darko</figcaption>
        </figure>
        <figure className="flex w-[5.5rem] flex-col items-center gap-2">
          <Photo file="magdalena.jpg" name="Magdalena" className="h-[5.5rem] w-[5.5rem] border-[3px] border-white shadow-[0_14px_30px_-14px_rgba(194,87,107,0.7)]" />
          <figcaption className="text-xs font-semibold tracking-wide text-muted">Magdalena</figcaption>
        </figure>
      </div>
    </div>
  );
}

/* N · arcade: PLAYER 1 / PLAYER 2 */
function VariantN() {
  return (
    <div className="flex items-start justify-center gap-4">
      <figure className="flex flex-col items-center gap-2">
        <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-[0.6rem] font-bold tracking-[0.2em] text-white">PLAYER 1</span>
        <Photo file="darko.jpg" name="Darko" className="h-24 w-24 border-4 border-white shadow-[0_16px_34px_-16px_rgba(63,42,48,0.7)] ring-2 ring-ink/70" />
        <figcaption className="text-xs font-semibold tracking-wide text-muted">Darko</figcaption>
      </figure>
      <span className="mt-[3.4rem] font-mono text-xl font-bold tracking-[0.15em] text-rose">VS</span>
      <figure className="flex flex-col items-center gap-2">
        <span className="rounded-md bg-rose px-2 py-0.5 font-mono text-[0.6rem] font-bold tracking-[0.2em] text-white">PLAYER 2</span>
        <Photo file="magdalena.jpg" name="Magdalena" className="h-24 w-24 border-4 border-white shadow-[0_16px_34px_-16px_rgba(194,87,107,0.8)] ring-2 ring-rose/80" />
        <figcaption className="text-xs font-semibold tracking-wide text-muted">Magdalena</figcaption>
      </figure>
    </div>
  );
}

export default function PreviewAvatarsTwo() {
  return (
    <main className="mx-auto flex max-w-[32rem] flex-col gap-8 px-4 py-10">
      <Card label="E · Round one, serif imena">
        <VariantE />
      </Card>
      <Card label="F · tamna pilula, zlatni VS">
        <VariantF />
      </Card>
      <Card label="G · dijagonalno">
        <VariantG />
      </Card>
      <Card label="H · pulsirajuci prstenovi (roze i zlatni)">
        <VariantH />
      </Card>
      <Card label="I · rotirajuci isprekidani VS, obojene trake sa imenom">
        <VariantI />
      </Card>
      <Card label="J · nalepnice, blago nakrivljene">
        <VariantJ />
      </Card>
      <Card label="K · kompaktan red u jednoj piluli">
        <VariantK />
      </Card>
      <Card label="L · meki sjaj iza slika, VS samo konturom">
        <VariantL />
      </Card>
      <Card label="M · tackasti luk izmedju">
        <VariantM />
      </Card>
      <Card label="N · arkadno: PLAYER 1 / PLAYER 2">
        <VariantN />
      </Card>
    </main>
  );
}
