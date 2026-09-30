import { ImageResponse } from "next/og";

import { FriendsWordmark } from "@/components/brand/friends-wordmark";
import { getFriendsFontBuffer } from "@/lib/friends-font";
import { exampleBusinessDetails } from "@/lib/site";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = `${exampleBusinessDetails.name}: carta digital de cafés, dulces y algo para picar.`;

const friendsFont = { name: "Friends", data: getFriendsFontBuffer() };

function CoffeeCupMark() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="280"
      height="280"
      viewBox="0 0 64 64"
      role="img"
      style={{ display: "block" }}
    >
      <rect width="64" height="64" rx="14" fill="#F1C40F" />
      <circle
        cx="32"
        cy="20"
        r="5"
        fill="none"
        stroke="#4C2E8F"
        strokeWidth="2.5"
      />
      <path
        d="M14 26h36v8a18 18 0 0 1-18 18 18 18 0 0 1-18-18z"
        fill="#FFF8EF"
      />
      <path
        d="M50 26h2a6 6 0 0 1 0 12h-4"
        fill="none"
        stroke="#FFF8EF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="12" y="52" width="40" height="4" rx="2" fill="#E8642C" />
    </svg>
  );
}

export default function OpenGraphImage() {
  const { tagline, shortName } = exampleBusinessDetails;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        background: "#FFF8EF",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: "0 0 420px",
          alignItems: "center",
          justifyContent: "center",
          background: "#4C2E8F",
        }}
      >
        <CoffeeCupMark />
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
          padding: "0 72px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 30,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#7A5C43",
          }}
        >
          {shortName}
        </p>
        <FriendsWordmark
          style={{
            fontFamily: "Friends",
            fontWeight: 400,
            fontSize: 84,
            lineHeight: 1.05,
          }}
        />
        <p
          style={{
            margin: 0,
            fontSize: 34,
            fontStyle: "italic",
            color: "#7A5C43",
          }}
        >
          {tagline}
        </p>
      </div>
    </div>,
    {
      ...size,
      fonts: [friendsFont],
    },
  );
}
