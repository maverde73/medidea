import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken, isValidEmail } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

interface User {
  id: number;
  email: string;
  password_hash: string;
  nome: string;
  cognome: string;
  role: "admin" | "tecnico" | "user";
  active: number;
}

/**
 * Login endpoint
 * Authenticates user and returns JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get JWT secret
    const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-in-production";

    // In development mode (or when using dev secret), return mock response
    const isDevelopment = process.env.NODE_ENV !== "production" ||
      jwtSecret === "dev-secret-change-in-production";

    if (isDevelopment) {
      // Check for specific dev credentials
      if (email === "admin@medidea.local" && password === "admin123") {
        // Mock user for testing
        const mockUser = {
          id: 1,
          email: "admin@medidea.local",
          role: "admin" as const,
        };

        const mockToken = await generateToken(mockUser, jwtSecret);

        return NextResponse.json({
          success: true,
          token: mockToken,
          user: {
            id: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
          },
        });
      } else {
        // Invalid dev credentials
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }
    }

    // Production: query database
    const { env } = getCloudflareContext();
    const db = createDatabaseClient(env);

    const user = await db.queryFirst<User>(
      "SELECT * FROM utenti WHERE email = ? AND active = 1",
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last_login
    await db.execute(
      "UPDATE utenti SET last_login = datetime('now') WHERE id = ?",
      [user.id]
    );

    const token = await generateToken(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        cognome: user.cognome,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Login failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
