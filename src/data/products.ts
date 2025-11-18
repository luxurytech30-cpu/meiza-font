import { Product } from '@/contexts/CartContext';
import productVase from '@/assets/product-vase.jpg';
import productBowl from '@/assets/product-bowl.jpg';
import productMirror from '@/assets/product-mirror.jpg';
import productCandles from '@/assets/product-candles.jpg';

export const products: Product[] = [
  {
    id: '1',
    name: {
      en: 'Golden Heritage Vase',
      he: 'אגרטל מורשת זהב',
    },
    price: 3200,
    image: productVase,
    description: {
      en: 'An exquisite hand-crafted vase featuring luxurious gold accents on premium marble. A statement piece that elevates any space.',
      he: 'אגרטל מעוצב בעבודת יד עם הדגשות זהב מפוארות על שיש פרמיום. פריט הצהרה המעלה כל חלל.',
    },
    category: 'vases',
    material: 'Marble & 24K Gold Plating',
    dimensions: '30cm H × 15cm W',
  },
  {
    id: '2',
    name: {
      en: 'Elegance Marble Bowl',
      he: 'קערת שיש אלגנטית',
    },
    price: 2800,
    image: productBowl,
    description: {
      en: 'A sophisticated decorative bowl crafted from premium white marble with subtle gold veining. Perfect for modern luxury interiors.',
      he: 'קערה דקורטיבית מתוחכמת מעוצבת משיש לבן פרמיום עם עורקי זהב עדינים. מושלמת לעיצוב פנים מודרני יוקרתי.',
    },
    category: 'accessories',
    material: 'Premium White Marble',
    dimensions: '25cm Diameter × 12cm H',
  },
  {
    id: '3',
    name: {
      en: 'Baroque Gold Mirror',
      he: 'מראה זהב בארוק',
    },
    price: 4500,
    image: productMirror,
    description: {
      en: 'An ornate gold-framed mirror inspired by classical baroque design. Meticulously crafted to add grandeur to your living space.',
      he: 'מראה במסגרת זהב מעוטרת בהשראת עיצוב בארוק קלאסי. מעוצבת בקפידה להוסיף הדר לחלל המגורים שלך.',
    },
    category: 'mirrors',
    material: 'Gilded Wood Frame & Crystal Glass',
    dimensions: '90cm H × 70cm W',
  },
  {
    id: '4',
    name: {
      en: 'Heritage Candle Collection',
      he: 'אוסף נרות מורשת',
    },
    price: 1800,
    image: productCandles,
    description: {
      en: 'A curated set of luxury candle holders in black and gold. Each piece designed to create an ambiance of refined elegance.',
      he: 'סט נבחר של פמוטים יוקרתיים בשחור וזהב. כל פריט מעוצב ליצירת אווירה של אלגנטיות מעודנת.',
    },
    category: 'accessories',
    material: 'Brass & Marble',
    dimensions: 'Set of 3: 20cm, 25cm, 30cm H',
  },
  {
    id: '5',
    name: {
      en: 'Imperial Decorative Vase',
      he: 'אגרטל דקורטיבי אימפריאלי',
    },
    price: 3600,
    image: productVase,
    description: {
      en: 'A majestic vase featuring intricate gold detailing on black marble. An imperial piece for the most discerning collectors.',
      he: 'אגרטל מלכותי עם פירוט זהב מורכב על שיש שחור. פריט אימפריאלי לאספנים הבררניים ביותר.',
    },
    category: 'vases',
    material: 'Black Marble & Gold Leaf',
    dimensions: '35cm H × 18cm W',
  },
  {
    id: '6',
    name: {
      en: 'Luxury Console Mirror',
      he: 'מראת קונסולה יוקרתית',
    },
    price: 5200,
    image: productMirror,
    description: {
      en: 'A stunning oversized mirror with an elaborate gold frame. Creates a focal point in any sophisticated interior.',
      he: 'מראה מרהיבה בגודל גדול עם מסגרת זהב מעוטרת. יוצרת נקודת מוקד בכל עיצוב פנים מתוחכם.',
    },
    category: 'mirrors',
    material: 'Hand-Carved Gold Frame',
    dimensions: '120cm H × 90cm W',
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return products;
  return products.filter((product) => product.category === category);
};
