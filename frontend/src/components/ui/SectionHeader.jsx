import FadeInView from './FadeInView'

export default function SectionHeader({
  label,
  title,
  description,
  align = 'center',
  className = '',
}) {
  const alignClass =
    align === 'center'
      ? 'text-center mx-auto'
      : align === 'left'
        ? 'text-left'
        : 'text-right ml-auto'

  return (
    <FadeInView className={`max-w-3xl mb-16 ${alignClass} ${className}`}>
      {label && (
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
          {label}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-heading tracking-tight text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-subtle leading-relaxed text-balance">
          {description}
        </p>
      )}
    </FadeInView>
  )
}
