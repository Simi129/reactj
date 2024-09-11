interface TelegramWebApps {
  WebApp: {
    showPopup(params: {
      title?: string;
      message: string;
      buttons?: Array<{
        type: 'ok' | 'close' | 'cancel' | 'destructive';
        text?: string;
        id?: string;
      }>;
    }): void;
    // Добавьте здесь другие методы WebApp, которые вы используете
  };
  // Добавьте здесь другие свойства Telegram, если они вам нужны
}

declare global {
  interface Window {
    Telegram?: TelegramWebApps;
  }
}

export {};