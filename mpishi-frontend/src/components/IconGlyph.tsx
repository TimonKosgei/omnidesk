export function IconGlyph({ symbol, className = '' }: { symbol: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex items-center justify-center text-current ${className}`}>
      {symbol}
    </span>
  )
}
