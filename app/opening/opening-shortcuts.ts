type OpeningShortcutEvent = Pick<
  KeyboardEvent,
  "altKey" | "ctrlKey" | "key" | "metaKey" | "shiftKey"
>;

export function isOpeningSkipShortcut(event: OpeningShortcutEvent) {
  return (
    (event.key === "End" || event.key === "ArrowRight") &&
    event.shiftKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  );
}
