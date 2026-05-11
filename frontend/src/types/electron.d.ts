export {};

declare global {
  interface Window {
    electronAPI?: {
      reviewSubmission: (id: string) => void;
      openApp: () => void;
      shareSubmission: (title: string) => void;
      closeTray: () => void;
      onNavigateToSubmission: (callback: (id: string) => void) => () => void;
    };
  }
}
