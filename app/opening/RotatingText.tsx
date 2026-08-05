type RotatingTextProps = {
  words: readonly string[];
  className?: string;
};

export function RotatingText({ words, className }: RotatingTextProps) {
  return (
    <span
      className={className}
      data-rotating-text
      aria-label={words.join(", ")}
    >
      {words.map((word, wordIndex) => (
        <span
          key={word}
          data-rotating-word={wordIndex}
          aria-hidden="true"
        >
          {[...word].map((character, characterIndex) => (
            <span
              key={`${word}-${characterIndex}`}
              data-rotating-character
            >
              {character === " " ? "\u00a0" : character}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
