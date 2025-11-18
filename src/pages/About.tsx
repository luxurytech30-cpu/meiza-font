import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import aboutImage from "@/assets/about-heritage.jpg";

const About = () => {
  const { t, language } = useLanguage();

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-foreground">
            {t("about.title")}
          </h1>
          <p className="text-xl text-muted-foreground">{t("about.subtitle")}</p>
        </div>

        {/* Hero Image */}
        <div className="mb-16">
          <img
            src={aboutImage}
            alt={
              language === "he"
                ? "אומנות וקרפטסמנשיפ של מייזה הריטג'"
                : "MEIZA HERITAGE craftsmanship"
            }
            className="w-full h-[500px] object-cover shadow-elegant"
          />
        </div>

        {/* Story + Mission */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="p-8 md:p-12 border-border">
            <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">
              {t("about.story.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {t("about.story.content")}
            </p>

            <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">
              {t("about.mission.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("about.mission.content")}
            </p>
          </Card>
        </div>

        {/* Values */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center mb-12 text-foreground">
            {t("about.values.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border-border hover:border-accent transition-colors">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {t("about.values.quality")}
              </h3>
              <p className="text-muted-foreground">
                {language === "he"
                  ? "כל פריט נבחר בקפידה בזכות איכות עליונה ויופי מתמשך."
                  : "Every piece is carefully selected for its superior quality and lasting beauty."}
              </p>
            </Card>

            <Card className="p-8 text-center border-border hover:border-accent transition-colors">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {t("about.values.craftsmanship")}
              </h3>
              <p className="text-muted-foreground">
                {language === "he"
                  ? "טכניקות מסורתיות נפגשות עם עיצוב מודרני בכל פריט בעבודת יד."
                  : "Traditional techniques meet modern design in every handcrafted item."}
              </p>
            </Card>

            <Card className="p-8 text-center border-border hover:border-accent transition-colors">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👑</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {t("about.values.elegance")}
              </h3>
              <p className="text-muted-foreground">
                {language === "he"
                  ? "עיצובים קלאסיים שחוצים מגמות ומרוממים כל חלל."
                  : "Classic designs that transcend trends and elevate any space."}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default About;
