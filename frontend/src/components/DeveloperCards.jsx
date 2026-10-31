import { UserRound } from 'lucide-react';

const DEVELOPERS = [
  {
    name: 'Ronak Gupta',
    program: 'Computer Science and Business Systems',
    year: '2nd year',
    id: 'BTCB25O1108',
    image: '/ronak-gupta.png',
  },
  {
    name: 'Tanishka Singh Snegar',
    program: 'Computer Science and Business Systems',
    id: 'BTCB25O1133',
    image: '/tanishka-singh-snegar.png',
  },
];

export default function DeveloperCards() {
  return (
    <section aria-labelledby="developers-heading" className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-500">The team behind CyberGuard</p>
        <h2 id="developers-heading" className="mt-1 text-lg font-bold text-slate-100">Meet the Developers</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {DEVELOPERS.map((developer) => (
          <article
            key={developer.id}
            className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:shadow-md"
          >
            {developer.image ? (
              <img
                src={developer.image}
                alt={`${developer.name} profile`}
                className="h-20 w-20 shrink-0 rounded-xl border border-slate-700 object-cover object-center"
              />
            ) : (
              <div
                aria-label={`Photo placeholder for ${developer.name}`}
                className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-slate-600 bg-slate-950/60 text-slate-400"
              >
                <UserRound className="h-7 w-7" aria-hidden="true" />
                <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider">Photo</span>
              </div>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-100">{developer.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{developer.program}</p>
              {developer.year && <p className="mt-1 text-xs font-medium text-slate-500">{developer.year}</p>}
              <p className="mt-2 inline-flex rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-cyan-300">
                {developer.id}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
