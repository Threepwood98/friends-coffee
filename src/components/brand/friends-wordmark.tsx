import type { CSSProperties } from "react";

import { exampleBusinessDetails } from "@/lib/site";

const lettersPalette = ["#4C2E8F", "#D95A17", "#241712", "#8A5A2B"];

interface FriendsWordmarkProps {
  text?: string;
  className?: string;
  style?: CSSProperties;
  tone?: "inherit" | "multicolor";
}

export function FriendsWordmark({
  text,
  className,
  style,
  tone = "multicolor",
}: FriendsWordmarkProps) {
  const chars = Array.from(text ?? exampleBusinessDetails.name);

  return (
    <span className={className} style={style} translate="no">
      {chars.map((char, index) =>
        char === " " ? (
          <span key={`${index}-space`}>&nbsp;</span>
        ) : (
          <span
            key={`${index}-${char}`}
            style={{
              color:
                tone === "inherit"
                  ? "currentColor"
                  : lettersPalette[index % lettersPalette.length],
            }}
          >
            {char}
          </span>
        ),
      )}
    </span>
  );
}
