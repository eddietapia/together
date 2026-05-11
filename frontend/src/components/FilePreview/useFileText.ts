import { useEffect, useState } from 'react';
import {
  fetchSubmissionFileText,
  type FileVersion,
} from '@/api/submissions';

export interface FileTextState {
  text: string | null;
  loading: boolean;
  error: string | null;
}

export function useFileText(
  submissionId: string,
  fileId: string,
  version: FileVersion
): FileTextState {
  const [state, setState] = useState<FileTextState>({
    text: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ text: null, loading: true, error: null });
    fetchSubmissionFileText(submissionId, fileId, version)
      .then(text => {
        if (!cancelled) setState({ text, loading: false, error: null });
      })
      .catch(err => {
        if (!cancelled)
          setState({
            text: null,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          });
      });
    return () => {
      cancelled = true;
    };
  }, [submissionId, fileId, version]);

  return state;
}
