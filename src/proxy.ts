import { NextResponse, type NextRequest } from "next/server";

function unauthorized() {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="nita-admin", charset="UTF-8"',
    },
  });
}

function parseBasicAuth(value: string | null) {
  if (!value?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = Buffer.from(value.slice("Basic ".length), "base64").toString(
      "utf8",
    );
    const separator = decoded.indexOf(":");

    if (separator === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    if (process.env.NODE_ENV === "production") {
      return new Response("ADMIN_PASSWORD is not configured.", { status: 503 });
    }

    return NextResponse.next();
  }

  const credentials = parseBasicAuth(request.headers.get("authorization"));
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";

  if (
    credentials?.username === adminUsername &&
    credentials.password === adminPassword
  ) {
    return NextResponse.next();
  }

  return unauthorized();
}

export const config = {
  matcher: "/admin/:path*",
};
