"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Github, Linkedin, Twitter, Mail } from "lucide-react";

const socials = [
  { icon: Github, label: "GitHub", href: "#", color: "#E6E8EB" },
  { icon: Linkedin, label: "LinkedIn", href: "#", color: "#0A66C2" },
  { icon: Twitter, label: "Twitter", href: "#", color: "#1DA1F2" },
  { icon: Mail, label: "Email", href: "mailto:hello@example.com", color: "#6C63FF" },
];

export default function ContactWidget() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFormState({ name: "", email: "", message: "" });
    }, 3000);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Social Links */}
      <div className="flex gap-2">
        {socials.map(({ icon: Icon, label, href, color }) => (
          <motion.a
            key={label}
            href={href}
            whileHover={{ y: -2, scale: 1.05 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-text-muted transition-colors hover:text-text-primary"
            title={label}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </motion.a>
        ))}
      </div>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-2">
        <input
          type="text"
          placeholder="Name"
          value={formState.name}
          onChange={(e) =>
            setFormState((s) => ({ ...s, name: e.target.value }))
          }
          className="rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent/50"
        />
        <input
          type="email"
          placeholder="Email"
          value={formState.email}
          onChange={(e) =>
            setFormState((s) => ({ ...s, email: e.target.value }))
          }
          className="rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent/50"
        />
        <textarea
          placeholder="Your message..."
          value={formState.message}
          onChange={(e) =>
            setFormState((s) => ({ ...s, message: e.target.value }))
          }
          rows={3}
          className="flex-1 resize-none rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent/50"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium transition-colors ${
            sent
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-accent/10 text-accent hover:bg-accent/20"
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          {sent ? "Sent!" : "Send Message"}
        </motion.button>
      </form>
    </div>
  );
}
