import type { ReactNode } from "react";

interface DataTableProps {
  title?: string;
  meta?: string;
  columns: string[];
  rows: { key: string; cells: ReactNode[] }[];
  emptyMessage: string;
}

// Figma "My review queue": titled card, tinted header row, centered
// equal-width columns.
export function DataTable({ title, meta, columns, rows, emptyMessage }: DataTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      {title ? (
        <header className="flex h-16 items-center justify-between px-5">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {meta ? <span className="text-sm text-muted-foreground">{meta}</span> : null}
        </header>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] table-fixed text-sm text-foreground">
          <thead className="bg-secondary">
            <tr className="h-[45px]">
              {columns.map((column) => (
                <th key={column} scope="col" className="px-4 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="h-[70px]">
                <td colSpan={columns.length} className="px-4 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key} className="h-[70px] border-t border-border first:border-t-0">
                  {row.cells.map((cell, index) => (
                    <td key={index} className="px-4 text-center">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
