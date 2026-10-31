import {
  Activity,
  AlarmClock,
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  BookOpenCheck,
  Braces,
  ChartNoAxesCombined,
  ClipboardCheck,
  Database,
  FileSearch,
  Fingerprint,
  Globe2,
  LockKeyhole,
  ScanEye,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from 'lucide-react';

export const navigation = [
  { label: 'Risk Engine', href: '#risk-engine' },
  { label: 'Modules', href: '#modules' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export const trustStandards = [
  { label: 'GDPR', detail: 'EU privacy framework' },
  { label: 'ISO 27001', detail: 'Information security standard' },
  { label: 'SOC 2', detail: 'Trust services criteria' },
  { label: 'IT Act 2000', detail: 'India technology law' },
  { label: 'DPDP Act', detail: 'India data protection law' },
];

export const stats = [
  { value: 12840, suffix: '+', label: 'Risk signals detected', display: '12,840+' },
  { value: 5240, suffix: '+', label: 'Scans completed', display: '5,240+' },
  { value: 98.6, suffix: '%', label: 'Detection accuracy', display: '98.6%' },
  { value: 1.8, suffix: 's', label: 'Average scan time', display: '1.8s' },
];

export const pillars = [
  {
    id: 'digital',
    eyebrow: '01 / DIGITAL',
    title: 'See the signals hiding in plain sight.',
    description: 'Surface suspicious senders, deceptive links, weak website controls, and infrastructure clues before they become incidents.',
    icon: Globe2,
    tone: 'cyan',
    tags: ['Phishing signals', 'Website posture', 'Link inspection'],
  },
  {
    id: 'legal',
    eyebrow: '02 / LEGAL',
    title: 'Turn dense language into clear decisions.',
    description: 'Find policy and contract clauses that deserve another look, with plain-language context and practical next steps.',
    icon: BookOpenCheck,
    tone: 'violet',
    tags: ['Terms analysis', 'Policy review', 'Actionable context'],
  },
  {
    id: 'privacy',
    eyebrow: '03 / PRIVACY',
    title: 'Understand how data is handled.',
    description: 'Review privacy notices for disclosure gaps, consent language, retention signals, and common framework requirements.',
    icon: Fingerprint,
    tone: 'mint',
    tags: ['Privacy signals', 'Consent review', 'Data disclosures'],
  },
];

export const modules = [
  {
    title: 'AI Threat Detection',
    description: 'Analyze suspicious email language, sender mismatches, and deceptive destinations in one readable report.',
    icon: ScanEye,
    label: 'EMAIL + WEB',
    tone: 'cyan',
  },
  {
    title: 'Privacy Leak Scanner',
    description: 'Review supplied policy text for privacy disclosures, retention language, and potentially exposed data practices.',
    icon: Database,
    label: 'PRIVACY',
    tone: 'mint',
  },
  {
    title: 'Legal & Compliance Analyzer',
    description: 'Compare policy language with selected GDPR, CCPA/CPRA, and India DPDP checklist requirements.',
    icon: ClipboardCheck,
    label: 'GOVERNANCE',
    tone: 'violet',
  },
  {
    title: 'Risk Scoring Engine',
    description: 'Bring findings together in a prioritized view that helps people decide what to inspect next.',
    icon: ChartNoAxesCombined,
    label: 'PRIORITIZATION',
    tone: 'amber',
  },
  {
    title: 'Real-Time Alerts',
    description: 'A concept preview for future monitoring workflows. Current scans run when you submit an analysis.',
    icon: BellRing,
    label: 'CONCEPT PREVIEW',
    tone: 'rose',
  },
  {
    title: 'Audit Reports',
    description: 'Keep scan history, review evidence, compare results, and export a shareable PDF summary.',
    icon: FileSearch,
    label: 'REPORTING',
    tone: 'blue',
  },
];

export const workflow = [
  {
    number: '01',
    title: 'Connect',
    description: 'Choose a website, email, or policy document to review. You control what you submit.',
    icon: Workflow,
  },
  {
    number: '02',
    title: 'Scan',
    description: 'Purpose-built checks inspect the submitted content and relevant technical signals.',
    icon: ScanEye,
  },
  {
    number: '03',
    title: 'AI analysis',
    description: 'Findings are organized with context so complex signals are easier to understand.',
    icon: Sparkles,
  },
  {
    number: '04',
    title: 'Take action',
    description: 'Review evidence, recommendations, history, and a report designed to support next steps.',
    icon: ArrowUpRight,
  },
];

export const pricingPlans = [
  {
    name: 'Explorer',
    description: 'For individuals getting a clearer view of everyday risk.',
    monthly: 0,
    yearly: 0,
    unit: 'forever',
    features: ['Core risk analysis modules', 'Scan history', 'PDF report exports'],
    cta: 'Explore the workspace',
    featured: false,
  },
  {
    name: 'Team',
    description: 'For small teams building a repeatable review workflow.',
    monthly: 29,
    yearly: 23,
    unit: 'per seat / month',
    features: ['Everything in Explorer', 'Shared review workflows', 'Priority support'],
    cta: 'Get protected',
    featured: true,
  },
  {
    name: 'Enterprise',
    description: 'For organizations with tailored governance requirements.',
    monthly: null,
    yearly: null,
    unit: 'custom',
    features: ['Tailored deployment discussion', 'Governance review', 'Dedicated onboarding'],
    cta: 'Talk to the team',
    featured: false,
  },
];

export const testimonials = [
  {
    quote: 'The useful part is not another score. It is being able to see the evidence and understand what deserves attention first.',
    name: 'Security lead',
    role: 'Illustrative team perspective',
    initials: 'SL',
    tone: 'cyan',
  },
  {
    quote: 'Turning long policy language into a focused list of questions gives our reviewers a much better place to start.',
    name: 'Privacy reviewer',
    role: 'Illustrative team perspective',
    initials: 'PR',
    tone: 'violet',
  },
  {
    quote: 'A clear report helps make technical and legal risk easier to discuss across the people who need to act on it.',
    name: 'Operations team',
    role: 'Illustrative team perspective',
    initials: 'OT',
    tone: 'mint',
  },
];

export const faqs = [
  {
    question: 'What does CyberGuard analyze?',
    answer: 'The workspace includes website security checks, phishing and email analysis, Terms and Conditions analysis, privacy compliance checklists, scan history, and PDF reports.',
  },
  {
    question: 'Does an automated result certify legal compliance?',
    answer: 'No. The compliance checker highlights language that may support, conflict with, or leave requirements inconclusive. It is an informational review aid, not legal advice or a compliance certification.',
  },
  {
    question: 'Is the interactive analysis demo a live scan?',
    answer: 'No. The landing-page widget uses a deterministic client-side demonstration and does not send the text or URL anywhere. Use the workspace modules for supported live analyses.',
  },
  {
    question: 'Does CyberGuard currently monitor continuously?',
    answer: 'Current scans run when you submit an analysis. The continuous monitoring and alert card on this page is explicitly marked as a concept preview.',
  },
  {
    question: 'Can I analyze an email without connecting an inbox?',
    answer: 'Yes. The email threat inspector accepts pasted email details and supported email files, so you can choose what content to provide.',
  },
  {
    question: 'Are the pricing, metrics, and testimonials live?',
    answer: 'No. The numbers, example quotes, and plan prices on this preview are illustrative—not measured production results, customer endorsements, or active subscription offers.',
  },
];
