"use client";

import { useState } from "react";
import { X } from "lucide-react";

// WhatsApp channels - Kinyarwanda and English only
const WHATSAPP_CHANNELS = [
  {
    id: "rw",
    flag: "🇷🇼",
    language: "Kinyarwanda",
    subtitle: "Ibiciro buri munsi · Ni ubuntu",
    url: "https://whatsapp.com/channel/0029VbCWE1Y2v1IuTcf3f91W",
  },
  {
    id: "en",
    flag: "🌍",
    language: "English",
    subtitle: "Daily prices · Free",
    url: "https://whatsapp.com/channel/0029VbComn7CHDygaXgijb0w",
  },
];

// Official WhatsApp icon SVG path
function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Modal component
function ChannelPickerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const handleChannelClick = (channel: (typeof WHATSAPP_CHANNELS)[0]) => {
    console.log(`[WhatsApp] Channel selected: ${channel.id} (${channel.language})`);
    window.open(channel.url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal - centered on desktop, bottom sheet on mobile */}
      <div
        className="fixed z-[101] bg-white rounded-t-2xl md:rounded-2xl shadow-xl
          inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:w-[360px] md:max-w-[90vw]"
        role="dialog"
        aria-modal="true"
        aria-label="Choose language for WhatsApp channel"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="font-outfit font-bold text-[17px] text-[var(--ink)]">
            Hitamo ururimi
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--surface)] flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-[var(--ink3)]" />
          </button>
        </div>

        {/* Channel list */}
        <div className="p-2">
          {WHATSAPP_CHANNELS.map((channel) => (
            <button
              key={channel.id}
              onClick={() => handleChannelClick(channel)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface)] transition-colors text-left"
            >
              <span className="text-2xl">{channel.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[15px] text-[var(--ink)]">
                  {channel.language}
                </p>
                <p className="text-[13px] text-[var(--ink3)] truncate">
                  {channel.subtitle}
                </p>
              </div>
              <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
            </button>
          ))}
        </div>

        {/* Mobile bottom padding for safe area */}
        <div className="h-6 md:hidden" />
      </div>
    </>
  );
}

// Main floating button component
export function WhatsAppButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating button - bottom-right, above mobile nav */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed z-50 right-4 bottom-20 md:bottom-6
          flex items-center gap-2 bg-[#25D366] text-white
          rounded-full shadow-lg hover:scale-105 transition-transform
          h-14 w-14 md:w-auto md:h-auto md:px-4 md:py-3
          justify-center"
        style={{
          boxShadow: "0 4px 12px rgba(37, 211, 102, 0.4)",
        }}
        aria-label="Follow Isoko Prices on WhatsApp"
      >
        <WhatsAppIcon className="w-6 h-6 md:w-5 md:h-5" />
        <span className="hidden md:inline font-medium text-[14px]">
          Kurikira kuri WhatsApp
        </span>
      </button>

      {/* Modal */}
      <ChannelPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

// Export modal opener for use in banner
export function useWhatsAppModal() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    Modal: () => (
      <ChannelPickerModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    ),
  };
}

export { WHATSAPP_CHANNELS, ChannelPickerModal };
