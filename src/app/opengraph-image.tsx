import { ImageResponse } from "next/og";

export const alt = "Stop the NITA Bill petition preview";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#000000",
          padding: "64px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#CE1126",
              }}
            />
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#D9A200",
              }}
            />
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#006B3F",
              }}
            />
            <span>stop the nita bill</span>
          </div>

          <div
            style={{
              border: "2px solid #eeeeee",
              borderRadius: 999,
              padding: "10px 18px",
              fontSize: 22,
              fontWeight: 800,
              color: "#666666",
            }}
          >
            petition
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "22px",
            maxWidth: 980,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 92,
              lineHeight: 0.94,
              fontWeight: 950,
              letterSpacing: "-5px",
            }}
          >
            <span style={{ color: "#CE1126" }}>imagine i needed a</span>
            <span style={{ color: "#D9A200" }}>certification to</span>
            <span style={{ color: "#006B3F" }}>build this.</span>
          </div>

          <div
            style={{
              maxWidth: 840,
              fontSize: 30,
              lineHeight: 1.35,
              color: "#555555",
              letterSpacing: "-0.5px",
            }}
          >
            {"Sign the petition against the NITA Bill 2025 and protect Ghana's developers, designers, freelancers, students, and self-taught builders."}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontSize: 24,
            color: "#777777",
            letterSpacing: "-0.3px",
          }}
        >
          <span>{"Ghana's tech ecosystem should stay open."}</span>
          <span style={{ color: "#000000", fontWeight: 900 }}>sign now</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
