import type { CSSProperties } from "react";

import { exampleBusinessDetails } from "@/lib/site";

const lettersPalette = ["#4C2E8F", "#D95A17", "#241712", "#8A5A2B"];

interface FriendsWordmarkProps {
  text?: string;
  className?: string;
  style?: CSSProperties;
}

export function FriendsWordmark({
  text,
  className,
  style,
}: FriendsWordmarkProps) {
  const chars = Array.from(text ?? exampleBusinessDetails.name);

  return (
    <span className={className} style={style}>
      {chars.map((char, index) =>
        char === " " ? (
          <span key={`${index}-space`}>&nbsp;</span>
        ) : (
          <span
            key={`${index}-${char}`}
            style={{
              color: lettersPalette[index % lettersPalette.length],
            }}
          >
            {char}
          </span>
        ),
      )}
    </span>
  );
}
