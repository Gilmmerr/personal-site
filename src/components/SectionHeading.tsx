interface SectionHeadingProps {
  eyebrow: string
  title: string
  desc?: string
}

export function SectionHeading({ eyebrow, title, desc }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl" data-reveal>
      <p className="eyebrow">
        <span className="h-px w-6 bg-accent2/60" />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-[clamp(1.6rem,3.2vw,2.35rem)] font-semibold leading-tight tracking-tight text-paper">
        {title}
      </h2>
      {desc && <p className="mt-3 text-[15px] leading-relaxed text-paper/55">{desc}</p>}
    </div>
  )
}
