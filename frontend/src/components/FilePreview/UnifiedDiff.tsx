import { useMemo } from 'react';
import { diffLines } from 'diff';

interface DiffRow {
  type: 'add' | 'remove' | 'context';
  oldNo: number | null;
  newNo: number | null;
  text: string;
}

function buildRows(current: string, proposed: string): DiffRow[] {
  const parts = diffLines(current, proposed);
  const rows: DiffRow[] = [];
  let oldNo = 1;
  let newNo = 1;

  for (const part of parts) {
    const lines = part.value.split('\n');
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

    for (const text of lines) {
      if (part.added) {
        rows.push({ type: 'add', oldNo: null, newNo: newNo++, text });
      } else if (part.removed) {
        rows.push({ type: 'remove', oldNo: oldNo++, newNo: null, text });
      } else {
        rows.push({ type: 'context', oldNo: oldNo++, newNo: newNo++, text });
      }
    }
  }
  return rows;
}

export function UnifiedDiff({
  currentText,
  proposedText,
}: {
  currentText: string;
  proposedText: string;
}) {
  const rows = useMemo(
    () => buildRows(currentText, proposedText),
    [currentText, proposedText]
  );

  if (rows.every(r => r.type === 'context')) {
    return (
      <div className="text-[11px] text-muted-foreground bg-white border border-border rounded-md px-3 py-2">
        No differences
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-md overflow-hidden">
      <div className="max-h-[480px] overflow-auto font-mono text-[11px] leading-5">
        <table className="w-full border-collapse">
          <tbody>
            {rows.map((r, i) => {
              const bg =
                r.type === 'add'
                  ? 'bg-green-50'
                  : r.type === 'remove'
                    ? 'bg-red-50'
                    : '';
              const sign =
                r.type === 'add' ? '+' : r.type === 'remove' ? '-' : ' ';
              const signColor =
                r.type === 'add'
                  ? 'text-green-700'
                  : r.type === 'remove'
                    ? 'text-red-700'
                    : 'text-muted-foreground/50';
              return (
                <tr key={i} className={bg}>
                  <td className="select-none px-2 py-0.5 text-right text-muted-foreground/70 align-top w-10 border-r border-border/40">
                    {r.oldNo ?? ''}
                  </td>
                  <td className="select-none px-2 py-0.5 text-right text-muted-foreground/70 align-top w-10 border-r border-border/40">
                    {r.newNo ?? ''}
                  </td>
                  <td
                    className={`select-none px-1 py-0.5 align-top w-4 ${signColor}`}
                  >
                    {sign}
                  </td>
                  <td className="px-2 py-0.5 text-foreground/90 whitespace-pre-wrap break-words">
                    {r.text}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
