import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken, isValidEmail } from "@/lib/auth";

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

    // In development mode, return mock response
    if (process.env.NODE_ENV === "development") {
      // Mock user for testing
      const mockUser = {
        id: 1,
        email: "admin@medidea.local",
        role: "admin" as const,
      };

      const mockToken = await generateToken(
        mockUser,
        process.env.JWT_SECRET || "dev-secret-change-in-production"
      );

      return NextResponse.json({
        success: true,
        token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    }

    // Production code would query database here
    // const db = createDatabaseClient(env);
    // const user = await db.queryFirst<User>(
    //   "SELECT * FROM users WHERE email = ? AND active = 1",
    //   [email]
    // );
    //
    // if (!user) {
    //   return NextResponse.json(
    //     { error: "Invalid credentials" },
    //     { status: 401 }
    //   );
    // }
    //
    // const isValidPassword = await verifyPassword(password, user.password_hash);
    //
    // if (!isValidPassword) {
    //   return NextResponse.json(
    //     { error: "Invalid credentials" },
    //     { status: 401 }
    //   );
    // }
    //
    // // Update last_login
    // await db.execute(
    //   "UPDATE users SET last_login = datetime('now') WHERE id = ?",
    //   [user.id]
    // );
    //
    // const token = await generateToken(user, env.JWT_SECRET);
    //
    // return NextResponse.json({
    //   success: true,
    //   token,
    //   user: {
    //     id: user.id,
    //     email: user.email,
    //     nome: user.nome,
    //     cognome: user.cognome,
    //     role: user.role,
    //   },
    // });

    return NextResponse.json(
      { error: "Login not fully implemented" },
      { status: 501 }
    );
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
