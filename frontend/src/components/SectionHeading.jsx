import Reveal from './Reveal';

export default function SectionHeading({ eyebrow, title, description, align = 'center' }) {
  const centered = align === 'center';
  return (
    <Reveal className={`cg-section-heading ${centered ? 'is-centered' : ''}`}>
      <span className="cg-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </Reveal>
  );
}
