interface BadgeProps {
  color: 'green' | 'yellow' | 'red' | 'blue' | 'zinc'
  children: React.ReactNode
}

const colors = {
  green: 'bg-green-900/40 text-green-400 border-green-800',
  yellow: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  red: 'bg-red-900/40 text-red-400 border-red-800',
  blue: 'bg-blue-900/40 text-blue-400 border-blue-800',
  zinc: 'bg-zinc-800 text-zinc-400 border-zinc-700',
}

export function Badge({ color, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  )
}
