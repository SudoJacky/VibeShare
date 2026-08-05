"use client";

import { useEffect, useState } from "react";

const ENCRYPTED_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number;
  maxIterations?: number;
}

function encrypt(text: string) {
  return Array.from(text, (character) => {
    if (character === " ") return character;
    return ENCRYPTED_CHARACTERS[
      Math.floor(Math.random() * ENCRYPTED_CHARACTERS.length)
    ];
  }).join("");
}

export function DecryptedText({
  text,
  className,
  speed = 60,
  maxIterations = 9,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(() => encrypt(text));

  useEffect(() => {
    let iteration = 0;
    let interval: number | undefined;

    const startTimer = window.setTimeout(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplayText(text);
        return;
      }

      setDisplayText(encrypt(text));
      interval = window.setInterval(() => {
        iteration += 1;
        if (iteration >= maxIterations) {
          window.clearInterval(interval);
          setDisplayText(text);
          return;
        }

        setDisplayText(encrypt(text));
      }, speed);
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [maxIterations, speed, text]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{displayText}</span>
    </span>
  );
}
