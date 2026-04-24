/**
 * Telegram Configuration Validation
 * Run on application startup to ensure all required environment variables are set
 */

function validateTelegramConfig(): void {
  const errors: string[] = [];

  if (!process.env.TELEGRAM_BOT_TOKEN?.trim()) {
    errors.push("TELEGRAM_BOT_TOKEN environment variable is not set");
  }

  if (!process.env.TELEGRAM_CHAT_ID?.trim()) {
    errors.push("TELEGRAM_CHAT_ID environment variable is not set");
  }

  if (errors.length > 0) {
    console.warn(
      "⚠️  TELEGRAM CONFIGURATION WARNINGS:\n" +
        errors.map((e) => `  - ${e}`).join("\n") +
        "\n\n" +
        "📋 Two-factor verification will not work without proper Telegram configuration.\n" +
        "📖 See .env.example for required variables.\n",
    );
  } else {
    console.log("✅ Telegram configuration validated successfully");
  }
}

// Validate on module load (server-side only)
if (typeof window === "undefined") {
  validateTelegramConfig();
}

export { validateTelegramConfig };
