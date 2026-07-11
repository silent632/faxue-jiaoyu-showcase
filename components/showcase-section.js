export default function ShowcaseSection({
  title,
  eyebrow,
  description,
  className = "",
  children,
  ...props
}) {
  return (
    <section className={`showcase-section ${className}`.trim()} {...props}>
      <div className="showcase-section-heading">
        {eyebrow ? <p className="showcase-section-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p className="showcase-section-description">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
