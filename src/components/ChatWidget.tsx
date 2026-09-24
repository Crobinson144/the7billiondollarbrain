"use client";

import Script from "next/script";

/** Loads the configured live-chat provider (Crisp or Tawk.to). Renders nothing when neither is set. */
export function ChatWidget({ crispId, tawkProperty, tawkWidget }: { crispId: string; tawkProperty: string; tawkWidget: string }) {
  if (crispId) {
    return (
      <Script id="crisp-chat" strategy="lazyOnload">
        {`window.$crisp=[];window.CRISP_WEBSITE_ID=${JSON.stringify(crispId)};(function(){var d=document,s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`}
      </Script>
    );
  }
  if (tawkProperty) {
    const src = `https://embed.tawk.to/${encodeURIComponent(tawkProperty)}/${encodeURIComponent(tawkWidget || "default")}`;
    return <Script id="tawk-chat" strategy="lazyOnload" src={src} />;
  }
  return null;
}

/** Opens the chat window from a button, when a provider is loaded. */
export function OpenChatButton({ className = "btn-gold" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const w = window as unknown as { $crisp?: unknown[][]; Tawk_API?: { maximize?: () => void } };
        if (w.$crisp) w.$crisp.push(["do", "chat:open"]);
        else w.Tawk_API?.maximize?.();
      }}
    >
      Start live chat
    </button>
  );
}
