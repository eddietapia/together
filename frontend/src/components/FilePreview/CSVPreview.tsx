import { useMemo } from 'react';
import Papa from 'papaparse';
import type { FileVersion } from '@/api/submissions';
import { useFileText } from './useFileText';
import { PreviewError, PreviewLoading } from './PreviewShell';

const ROW_LIMIT = 100;

export function CSVPreview({
  submissionId,
  fileId,
  version,
}: {
  submissionId: string;
  fileId: string;
  version: FileVersion;
}) {
  const { text, loading, error } = useFileText(submissionId, fileId, version);

  const parsed = useMemo(() => {
    if (text == null) return null;
    return Papa.parse<string[]>(text, {
      skipEmptyLines: true,
    });
  }, [text]);

  if (loading) return <PreviewLoading />;
  if (error) return <PreviewError message={error} />;
  if (!parsed) return null;

  const rows = parsed.data;
  if (rows.length === 0) {
    return (
      <div className="text-xs text-muted-foreground bg-white border border-border rounded-md px-3 py-2">
        Empty CSV
      </div>
    );
  }

  const header = rows[0]!;
  const body = rows.slice(1, ROW_LIMIT + 1);
  const totalDataRows = rows.length - 1;
  const truncated = totalDataRows > body.length;

  return (
    <div className="bg-white border border-border rounded-md overflow-hidden">
      <div className="max-h-[440px] overflow-auto">
        <table className="text-[11px] font-mono w-full border-collapse">
          <thead className="bg-stone-50 sticky top-0">
            <tr>
              {header.map((h, i) => (
                <th
                  key={i}
                  className="text-left px-2 py-1.5 font-semibold text-foreground border-b border-border whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, r) => (
              <tr key={r} className="even:bg-stone-50/40">
                {header.map((_, c) => (
                  <td
                    key={c}
                    className="px-2 py-1 text-foreground/90 border-b border-border/40 whitespace-nowrap"
                  >
                    {row[c] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[10px] text-muted-foreground px-3 py-1.5 border-t border-border bg-[#fffdf7]">
        {truncated
          ? `Showing ${body.length} of ${totalDataRows} rows · ${header.length} cols`
          : `${totalDataRows} ${totalDataRows === 1 ? 'row' : 'rows'} · ${header.length} cols`}
      </div>
    </div>
  );
}
