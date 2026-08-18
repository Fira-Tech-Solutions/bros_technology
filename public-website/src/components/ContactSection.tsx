import { Phone, MessageCircle, Send, Mail, MapPin, Clock } from "lucide-react";
import { useLocale } from "@/providers/locale";
import { useSettings, DEFAULT_SETTINGS } from "@/hooks/use-settings";

export function ContactSection() {
  const { t } = useLocale();
  const { data: s = DEFAULT_SETTINGS } = useSettings();

  const CONTACT = {
    phones: [
      { number: s.callNumber1, label: "Primary" },
      { number: s.callNumber2, label: "Secondary" },
    ],
    whatsapp: s.whatsappNumber,
    telegram: s.telegramHandle,
    email: s.contactEmail,
    location: s.location,
    hours: s.businessHours,
    googleMapUrl: s.shopGoogleMapUrl,
    mapAddress: s.shopMapAddress,
  };

  const SOCIALS = [
    {
      name: "Telegram",
      href: `https://t.me/${CONTACT.telegram}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M21.198 2.433a2.242 2.242 0 00-1.022.215l-17.12 6.734a1.1 1.1 0 00.042 2.098l4.357 1.408 1.837 5.743a.8.8 0 001.36.38l2.178-1.758 4.014 2.965a1.1 1.1 0 001.718-.536l3.38-15.693a1.1 1.1 0 00-1.377-1.314z" />
        </svg>
      ),
      color: "#0088cc",
      bg: "bg-[#0088cc]/10 hover:bg-[#0088cc]/20",
      text: "text-[#0088cc]",
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/${CONTACT.whatsapp.replace(/[^0-9]/g, "")}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        </svg>
      ),
      color: "#25D366",
      bg: "bg-[#25D366]/10 hover:bg-[#25D366]/20",
      text: "text-[#25D366]",
    },
    {
      name: "Facebook",
      href: s.facebookUrl,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
      color: "#1877F2",
      bg: "bg-[#1877F2]/10 hover:bg-[#1877F2]/20",
      text: "text-[#1877F2]",
    },
    {
      name: "Instagram",
      href: s.instagramUrl,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z" />
        </svg>
      ),
      color: "#E4405F",
      bg: "bg-[#E4405F]/10 hover:bg-[#E4405F]/20",
      text: "text-[#E4405F]",
    },
    {
      name: "TikTok",
      href: s.tiktokUrl,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0115.54 3h-3.09v12.4a2.592 2.592 0 01-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 004.3 1.38V7.3s-1.88.09-3.24-1.48z" />
        </svg>
      ),
      color: "#000000",
      bg: "bg-foreground/5 hover:bg-foreground/10",
      text: "text-foreground",
    },
    {
      name: "YouTube",
      href: s.youtubeUrl,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      color: "#FF0000",
      bg: "bg-[#FF0000]/10 hover:bg-[#FF0000]/20",
      text: "text-[#FF0000]",
    },
  ];

  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 md:p-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-brand">{t("footer.badge")}</p>
          <h2 className="mt-3 font-display text-fluid-2xl">{t("footer.title")}</h2>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_1px_1fr]">
          {/* Left: Contact details */}
          <div className="space-y-8">
            {/* Phone numbers */}
            <div>
              <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Phone
              </h3>
              <div className="space-y-3">
                {CONTACT.phones.map((p) => (
                  <a
                    key={p.number}
                    href={`tel:${p.number}`}
                    className="flex items-center gap-3 group"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand/20">
                      <Phone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{p.number}</p>
                      <p className="text-xs text-muted-foreground">{p.label}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                WhatsApp
              </h3>
              <a
                href={`https://wa.me/${CONTACT.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] transition-colors group-hover:bg-[#25D366]/20">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">{CONTACT.whatsapp}</p>
                  <p className="text-xs text-muted-foreground">Chat with us</p>
                </div>
              </a>
            </div>

            {/* Telegram */}
            <div>
              <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Telegram
              </h3>
              <a
                href={`https://t.me/${CONTACT.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0088cc]/10 text-[#0088cc] transition-colors group-hover:bg-[#0088cc]/20">
                  <Send className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">@{CONTACT.telegram}</p>
                  <p className="text-xs text-muted-foreground">Order via Telegram</p>
                </div>
              </a>
            </div>

            {/* Email */}
            <div>
              <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Email
              </h3>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 group">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand/20">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">{CONTACT.email}</p>
                  <p className="text-xs text-muted-foreground">Send us an email</p>
                </div>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden bg-border lg:block" />

          {/* Right: Social + Info */}
          <div className="space-y-10">
            {/* Social links grid */}
            <div>
              <h3 className="mb-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Follow Us
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center gap-2 rounded-2xl border border-border p-4 transition-all hover:scale-[1.03] hover:shadow-md ${s.bg}`}
                  >
                    <span className={s.text}>{s.icon}</span>
                    <span className="text-xs font-medium text-foreground">{s.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Location */}
            {CONTACT.googleMapUrl ? (
              <a
                href={CONTACT.googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand/20">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Location
                  </h4>
                  <p className="mt-1 font-medium text-foreground group-hover:text-brand transition-colors">
                    {CONTACT.mapAddress || CONTACT.location}
                  </p>
                  <p className="text-xs text-brand">Open in Google Maps</p>
                </div>
              </a>
            ) : (
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Location
                  </h4>
                  <p className="mt-1 font-medium text-foreground">{CONTACT.location}</p>
                </div>
              </div>
            )}

            {/* Hours */}
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Business Hours
                </h4>
                <p className="mt-1 font-medium text-foreground">{CONTACT.hours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 border-t border-border pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            <a
              href="https://firatech.systems"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-brand transition-colors"
            >
              FiraTech Systems
            </a>
            . All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
