type PresentationWindow = Pick<Window, "history" | "location">;

export function createPresentationHash(pageIndex: number, frame: number) {
  return `#/page/${pageIndex}/frame/${frame}`;
}

export function syncPresentationHash(
  targetWindow: PresentationWindow,
  pageIndex: number,
  frame: number,
) {
  const nextHash = createPresentationHash(pageIndex, frame);
  if (targetWindow.location.hash === nextHash) return;

  targetWindow.history.replaceState(
    targetWindow.history.state,
    "",
    nextHash,
  );
}
