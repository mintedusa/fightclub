interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
}

export function Table<T>({ columns, data, emptyMessage = 'Nicio înregistrare.' }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-800/50">
            {columns.map(col => (
              <th key={col.key} className="text-left px-4 py-3 text-zinc-400 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-zinc-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-zinc-200">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
