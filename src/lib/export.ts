export function exportToCSV(
  data: Array<Record<string, any>>,
  filename: string,
) {
  if (data.length === 0) return

  const headers = Object.keys(data[0]).join(',')
  const rows = data.map((row) =>
    Object.values(row)
      .map((value) => {
        // Handle values that might contain commas or quotes
        const stringValue = String(value ?? '')
        if (
          stringValue.includes(',') ||
          stringValue.includes('"') ||
          stringValue.includes('\n')
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(','),
  )
  const csv = [headers, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
