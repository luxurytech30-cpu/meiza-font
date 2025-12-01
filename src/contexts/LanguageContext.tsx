import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";

type Language = "en" | "he";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

type Translations = Record<string, string>;

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.cart": "Cart",

    // Home
    "home.hero.title": "MEIZA HERITAGE",
    "home.hero.subtitle": "Premium Home Décor & Lifestyle",
    "home.hero.cta": "Explore Collection",
    "home.featured.title": "Featured Collection",
    "home.featured.subtitle": "Curated pieces for sophisticated living",
    "home.story.title": "Our Heritage",
    "home.story.description":
      "MEIZA HERITAGE brings timeless elegance to modern living. Each piece is carefully selected to embody luxury, craftsmanship, and enduring beauty.",
    "home.story.cta": "Learn More",
    "home.featured.viewAll": "View All Products",

    // Products
    "products.title": "Our Collection",
    "products.all": "All Products",
    "products.vases": "Vases",
    "products.mirrors": "Mirrors",
    "products.accessories": "Accessories",
    "products.addToCart": "Add to Cart",
    "products.viewDetails": "View Details",

    // Product Detail
    "product.description": "Description",
    "product.details": "Details",
    "product.material": "Material",
    "product.dimensions": "Dimensions",
    "product.addToCart": "Add to Cart",

    // Cart
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.continueShopping": "Continue Shopping",
    "cart.subtotal": "Subtotal",
    "cart.shipping": "Shipping",
    "cart.total": "Total",
    "cart.checkout": "Proceed to Checkout",
    "cart.remove": "Remove",


       "cart.shippingDetails": "Shipping details",
    "cart.fullName": "Full name",
     "cart.email": "email ",
    "cart.phone": "Phone",
    "cart.city": "City",
    "cart.street": "Street / address",
    "cart.notes": "Notes (optional)",

    "cart.paymentMethod": "Payment method",
    "cart.cod": "Cash on delivery",
    "cart.card": "Credit card",

    "cart.processing": "Placing order...",
    "cart.cardUnavailable":
      "Card payments are not available yet. Please choose cash on delivery.",

    "cart.error_fullNameRequired": "Please enter your full name",
    "cart.error_phoneRequired": "Please enter your phone number",
    "cart.error_cityRequired": "Please enter your city",
    "cart.error_streetRequired": "Please enter your street address",


    // About
    "about.title": "About MEIZA HERITAGE",
    "about.subtitle": "Timeless Elegance, Modern Living",
    "about.story.title": "Our Story",
    "about.story.content":
      "Founded on the principles of exceptional craftsmanship and timeless design, MEIZA HERITAGE curates premium home décor that transforms living spaces into sanctuaries of elegance.",
    "about.mission.title": "Our Mission",
    "about.mission.content":
      "To bring the finest selection of home décor and lifestyle products to discerning customers who appreciate quality, heritage, and sophisticated design.",
    "about.values.title": "Our Values",
    "about.values.quality": "Exceptional Quality",
    "about.values.craftsmanship": "Master Craftsmanship",
    "about.values.elegance": "Timeless Elegance",

    // Contact
    "contact.title": "Contact Us",
    "contact.subtitle": "We'd love to hear from you",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.send": "Send Message",
    "contact.info.title": "Get in Touch",
    "contact.info.email": "Email",
    "contact.info.phone": "Phone",
    "contact.info.address": "Address",

    // Footer
    "footer.description": "Premium home décor and lifestyle products for sophisticated living.",
    "footer.links": "Quick Links",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved.",

    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success!",
  },

  he: {
    // Navigation
    "nav.home": "בית",
    "nav.products": "מוצרים",
    "nav.about": "אודות",
    "nav.contact": "צור קשר",
    "nav.cart": "עגלה",

    // Home
    "home.hero.title": "מייזה הריטג'",
    "home.hero.subtitle": "עיצוב בית ואורח חיים פרמיום",
    "home.hero.cta": "לקולקציה",
    "home.featured.title": "קולקציה נבחרת",
    "home.featured.subtitle": "פריטים מיוחדים לחיים מתוחכמים",
    "home.story.title": "המורשת שלנו",
    "home.story.description":
      "מייזה הריטג' מביאה אלגנטיות נצחית לחיים המודרניים. כל פריט נבחר בקפידה כדי להתגלם במותרות, אומנות ויופי מתמשך.",
    "home.story.cta": "קרא עוד",
    "home.featured.viewAll": "צפה בכל המוצרים",

    // Products
    "products.title": "הקולקציה שלנו",
    "products.all": "כל המוצרים",
    "products.vases": "אגרטלים",
    "products.mirrors": "מראות",
    "products.accessories": "אביזרים",
    "products.addToCart": "הוסף לעגלה",
    "products.viewDetails": "צפה בפרטים",

    // Product Detail
    "product.description": "תיאור",
    "product.details": "פרטים",
    "product.material": "חומר",
    "product.dimensions": "מידות",
    "product.addToCart": "הוסף לעגלה",

    // Cart
    "cart.title": "עגלת קניות",
    "cart.empty": "העגלה ריקה",
    "cart.continueShopping": "המשך בקניות",
    "cart.subtotal": "סכום ביניים",
    "cart.shipping": "משלוח",
    "cart.total": "סה\"כ",
    "cart.checkout": "המשך לתשלום",
    "cart.remove": "הסר",
       "cart.shippingDetails": "פרטי משלוח",
    "cart.fullName": "שם מלא",
    "cart.email": "מייל לקבלה",
    "cart.phone": "טלפון",
    "cart.city": "עיר",
    "cart.street": "רחוב / כתובת",
    "cart.notes": "הערות (לא חובה)",

    "cart.paymentMethod": "אמצעי תשלום",
    "cart.cod": "תשלום במזומן בעת קבלה",
    "cart.card": "כרטיס אשראי",

    "cart.processing": "מבצע את ההזמנה...",
    "cart.cardUnavailable":
      "תשלום בכרטיס אשראי עדיין לא זמין. אנא בחרו תשלום במזומן בעת קבלה.",

    "cart.error_fullNameRequired": "יש להזין שם מלא",
    "cart.error_phoneRequired": "יש להזין מספר טלפון",
    "cart.error_cityRequired": "יש להזין עיר",
    "cart.error_streetRequired": "יש להזין כתובת מלאה",


    // About
    "about.title": "אודות מייזה הריטג'",
    "about.subtitle": "אלגנטיות נצחית, חיים מודרניים",
    "about.story.title": "הסיפור שלנו",
    "about.story.content":
      "נוסדה על עקרונות של אומנות יוצאת דופן ועיצוב נצחי, מייזה הריטג' אוצרת עיצוב בית פרמיום שהופך חללי מגורים למקדשי אלגנטיות.",
    "about.mission.title": "המשימה שלנו",
    "about.mission.content":
      "להביא את מיטב המבחר של מוצרי עיצוב בית ואורח חיים ללקוחות בעלי טעם המעריכים איכות, מורשת ועיצוב מתוחכם.",
    "about.values.title": "הערכים שלנו",
    "about.values.quality": "איכות יוצאת דופן",
    "about.values.craftsmanship": "אומנות מעולה",
    "about.values.elegance": "אלגנטיות נצחית",

    // Contact
    "contact.title": "צור קשר",
    "contact.subtitle": "נשמח לשמוע ממך",
    "contact.name": "שם",
    "contact.email": "אימייל",
    "contact.message": "הודעה",
    "contact.send": "שלח הודעה",
    "contact.info.title": "צור קשר",
    "contact.info.email": "אימייל",
    "contact.info.phone": "טלפון",
    "contact.info.address": "כתובת",

    // Footer
    "footer.description": "מוצרי עיצוב לבית ואורח חיים באיכות פרימיום לחיים מלאי סגנון.",
    "footer.links": "קישורים מהירים",
    "footer.contact": "יצירת קשר",
    "footer.rights": "כל הזכויות שמורות.",

    // Common
    "common.loading": "טוען...",
    "common.error": "אירעה שגיאה",
    "common.success": "הצלחה!",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // optional: restore last choice or default by browser
  const initial = ((): Language => {
    const saved = localStorage.getItem("lang");
    if (saved === "he" || saved === "en") return saved;
    return navigator.language?.toLowerCase().startsWith("he") ? "he" : "en";
  })();

  const [language, setLanguageState] = useState<Language>(initial);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang);
  };

  const t = useMemo(
    () => (key: string) => translations[language][key] ?? key,
    [language]
  );

  // keep document direction synced
  useEffect(() => {
    document.documentElement.setAttribute("dir", language === "he" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === "he" ? "rtl" : "ltr"}>{children}</div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
};
