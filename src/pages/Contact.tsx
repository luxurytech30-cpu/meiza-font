// src/pages/Contact.tsx
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function Contact() {
  const { t } = useLanguage();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { id, value } = e.target;
    setForm((s) => ({ ...s, [id]: value }));
  }

  function validEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!validEmail(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSending(true);
    try {
      await api.post("/contact", form); // hits your Nodemailer route
      toast.success("Message sent. We’ll reply soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-foreground">
            {t("contact.title")}
          </h1>
          <p className="text-xl text-muted-foreground">{t("contact.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Form */}
          <Card className="p-8 border-border">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                  {t("contact.name")}
                </label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={onChange}
                  className="bg-secondary border-border text-foreground"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                  {t("contact.email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="bg-secondary border-border text-foreground"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                  {t("contact.message")}
                </label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={onChange}
                  className="bg-secondary border-border text-foreground min-h-[150px]"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={sending}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-gold"
              >
                {sending ? (t("contact.sending") ?? "Sending...") : t("contact.send")}
              </Button>
            </form>
          </Card>

          {/* Info */}
          <div className="space-y-8">
            <Card className="p-8 border-border">
              <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
                {t("contact.info.title")}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">{t("contact.info.email")}</h3>
                    <a href="mailto:MRCAZA17@GMAIL.COM" className="text-muted-foreground hover:text-accent">
                      MRCAZA17@GMAIL.COM
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">{t("contact.info.phone")}</h3>
                    <a href="tel:0544689375" className="text-muted-foreground hover:text-accent">
                      0544689375
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">{t("contact.info.address")}</h3>
                    <p className="text-muted-foreground">
                      Afula
                    </p>
                  </div>
                </div>
              </div>
            </Card>

           
          </div>
        </div>
      </div>
    </main>
  );
}
