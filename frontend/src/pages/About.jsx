import React from 'react';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Globe,
  Mail,
  Scale,
  ShieldCheck,
} from 'lucide-react';

const features = [
  {
    id: 'tc',
    icon: FileText,
    title: 'Terms & Privacy',
    text: 'Understand policy clauses about data use, renewals, arbitration, and one-sided changes in plain language.',
  },
  {
    id: 'phishing',
    icon: Mail,
    title: 'Email phishing',
    text: 'Check suspicious messages for warning signs such as sender mismatches, misleading links, impersonation, and pressure tactics.',
  },
  {
    id: 'website',
    icon: Globe,
    title: 'Website security',
    text: 'Review a website’s TLS certificate, HTTPS setup, and browser security headers.',
  },
  {
    id: 'compliance',
    icon: Scale,
    title: 'Privacy compliance',
    text: 'Review privacy notices against selected requirements from the GDPR, India’s DPDP Act, and California’s CCPA/CPRA.',
  },
];

const topics = [
  {
    group: 'Website security',
    items: [
      {
        term: 'SSL and TLS',
        text: 'These are protocols related to encrypting the connection between a client, such as a browser, and a website. SSL is outdated and deprecated; secure connections today use TLS. A browser lock icon indicates an encrypted connection, but does not guarantee that a website is honest or safe.',
      },
      {
        term: 'TLS certificate',
        text: 'A certificate links a website’s domain to a public key. Browsers check its validity, issuer, and whether the domain matches. A valid certificate does not prove that a website is trustworthy—scam websites can also use HTTPS.',
      },
      {
        term: 'HTTPS',
        text: 'The encrypted version of HTTP. HTTPS uses TLS to protect data while it travels between a browser and a website. Check the domain carefully before sharing sensitive information.',
      },
      {
        term: 'HSTS',
        text: 'HTTP Strict Transport Security is a header that tells browsers to use HTTPS on future visits. It helps reduce the risk of accidentally connecting over insecure HTTP.',
      },
      {
        term: 'Security headers (CSP, X-Frame-Options)',
        text: 'Rules sent with a website response that tell browsers how to load or display content. CSP can restrict scripts and other resources; X-Frame-Options can help prevent some clickjacking attacks.',
      },
    ],
  },
  {
    group: 'Email safety',
    items: [
      {
        term: 'Phishing',
        text: 'A fraudulent message that pretends to come from a trusted person or company to trick you into sharing a password, making a payment, or revealing other sensitive information.',
      },
      {
        term: 'Sender spoofing and Reply-To mismatch',
        text: 'A display name may look like a real company even when the email address uses another domain. A different Reply-To address may send your response somewhere else. Check the sender address and domain carefully.',
      },
      {
        term: 'Deceptive link',
        text: 'A link’s visible text may look like a trusted website while its actual URL leads to a different domain. Verify the destination before opening it.',
      },
      {
        term: 'Urgent messages and credential requests',
        text: 'Pressure such as “verify now or your account will be closed,” or requests for a password or one-time code, are warning signs. Open the official app or website yourself instead of following a message link.',
      },
    ],
  },
  {
    group: 'Privacy laws and rights',
    items: [
      {
        term: 'GDPR',
        text: 'The European Union’s General Data Protection Regulation sets rules for collecting and using personal data. It includes requirements for transparency and a lawful basis, as well as rights such as access, correction, and erasure. These rights are not absolute in every situation.',
      },
      {
        term: 'India DPDP Act, 2023',
        text: 'India’s Digital Personal Data Protection Act applies to the processing of digital personal data, subject to the Act’s scope and exceptions. It covers notices, consent rules, certain legitimate uses, reasonable safeguards, and some rights for individuals (Data Principals).',
      },
      {
        term: 'CCPA / CPRA',
        text: 'California consumer privacy laws. For businesses covered by these laws, rights may include knowing what personal information is collected, requesting deletion or correction, and opting out of certain sales or sharing.',
      },
      {
        term: 'Consent and lawful basis',
        text: 'Consent is one permission-based legal basis, but it is not the only possible basis under every privacy law or for every type of processing. The GDPR lists several lawful bases; the DPDP Act covers consent and specified legitimate uses.',
      },
      {
        term: 'Data minimization and retention',
        text: 'Data minimization means collecting only the personal data needed for a purpose. Retention describes how long data is kept; a clear retention policy helps prevent unnecessary long-term storage.',
      },
      {
        term: 'Grievance contact / DPO',
        text: 'A contact point for privacy concerns or rights requests. The GDPR requires a Data Protection Officer (DPO) for some organizations and situations; the DPDP Act has separate grievance redressal requirements. These roles should not automatically be treated as the same.',
      },
    ],
  },
  {
    group: 'Reports and risk results',
    items: [
      {
        term: 'Risk score and severity',
        text: 'Scores and labels are indicators to help prioritize findings; they are not formal certifications, legal opinions, or definitive proof of a breach. Review the report alongside the original policy or website and its context.',
      },
      {
        term: 'Limits of security scans',
        text: 'Automated checks evaluate only selected technical signals or the text you provide. Results may not account for website changes, incomplete inputs, or whether a particular law applies.',
      },
    ],
  },
];

export default function About({ setActiveTab }) {
  return (
    <div className="space-y-8 pb-16">
      <header className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-500">Simple guides</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              About CyberGuard
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
          Learn about security and privacy concepts in plain English. Explore what each feature does and find straightforward explanations of common terms.
        </p>
      </header>

      <section aria-labelledby="features-heading">
        <div className="mb-4">
          <h2 id="features-heading" className="text-lg font-semibold text-white">What can you do with CyberGuard?</h2>
          <p className="mt-1 text-sm text-slate-500">Select a card to open that feature.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {features.map(({ id, icon: Icon, title, text }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              className="group flex min-h-48 flex-col rounded-xl border border-slate-800 bg-slate-900/80 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-950/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Icon className="mb-4 h-5 w-5 text-blue-500" />
              <span className="text-base font-semibold text-white">{title}</span>
              <span className="mt-2 flex-1 text-sm leading-6 text-slate-400">{text}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-500">
                Open feature <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="risk-score-heading"
        className="overflow-hidden rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-950/70 via-slate-900 to-indigo-950/60 p-5 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-400/10 sm:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
              How CyberGuard calculates risk
            </p>
            <h2 id="risk-score-heading" className="mt-2 text-xl font-bold text-white sm:text-2xl">
              The score measures detected risk — not safety
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              A higher score means more potential risk and a greater need to review the findings. Each scan type adds severity-based points using its own heuristic; the score is capped below 100. Finding confidence is not included in the score.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-200">
            Higher score = higher risk
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            {
              title: 'Terms of Service',
              formula: 'Starts at 15; add Critical +25, High +18, Medium +10, Low +4 per finding. No findings: 12. Capped at 98.',
              bands: 'Safe <25 · Low 25–49 · Medium 50–74 · High 75+',
            },
            {
              title: 'Phishing email',
              formula: 'Starts at 10; add Critical +35, High +25, Medium +12, Low +5 per finding. No findings: 8. Capped at 99.',
              bands: 'Safe <15 · Low 15–34 · Medium 35–59 · High 60–79 · Critical 80+',
            },
            {
              title: 'Website security',
              formula: 'Starts at 15; add Critical +35, High +20, Medium +12, Low +5 per finding. No findings: 10. Capped at 99.',
              bands: 'Safe <20 · Low 20–44 · Medium 45–69 · High 70+',
            },
            {
              title: 'Privacy compliance',
              formula: 'Starts at 15; add 8 per potentially missing item, 22 per conflicting item, and 4 per inconclusive item. Capped at 98.',
              bands: 'Safe <25 · Low 25–44 · Medium 45–69 · High 70+',
            },
            {
              title: 'Combined audit',
              formula: 'Starts at 12; add Critical +35, High +20, Medium +10, Low +4, Informational +1 per finding. No findings: 10. Capped at 99.',
              bands: 'Safe <25 · Low 25–49 · Medium 50–74 · High 75–89 · Critical 90+',
            },
          ].map(({ title, formula, bands }) => (
            <article key={title} className="rounded-xl border border-slate-700/80 bg-slate-950/55 p-4">
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-300">{formula}</p>
              <p className="mt-3 border-t border-slate-800 pt-2 text-[11px] font-medium leading-5 text-cyan-200">
                Risk bands: {bands}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3.5 py-3 text-xs leading-5 text-amber-100/90">
          These are scan-specific estimates to help prioritize review—not a “safety percentage,” formal certification, legal opinion, or proof of a breach. Different scan types use different formulas and risk bands, so scores from different types are not directly comparable. Review the evidence and original source for context.
        </p>
      </section>

      <section aria-labelledby="guide-heading">
        <div className="mb-5 flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-500" />
          <div>
            <h2 id="guide-heading" className="text-lg font-semibold text-white">Important terms, simple explanations</h2>
            <p className="mt-1 text-sm text-slate-500">Use these guides as a quick reference.</p>
          </div>
        </div>

        <div className="space-y-6">
          {topics.map(({ group, items }) => (
            <section key={group} aria-label={group}>
              <h3 className="mb-3 text-sm font-semibold text-blue-500">{group}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map(({ term, text }) => (
                  <article key={term} className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
                    <h4 className="text-sm font-semibold text-white">{term}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <aside className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <h2 className="text-sm font-semibold text-amber-600">Please note</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          These guides are for educational purposes and are not legal advice. CyberGuard’s automated results highlight possible issues; they are not compliance certifications or final decisions about whether a law has been violated. Consult a qualified professional about a specific situation.
        </p>
      </aside>
    </div>
  );
}
