export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Offer price
  mrp: number; // Maximum Retail Price
  image: any;
  category:
    | "Hard Luggage"
    | "Soft Luggage"
    | "Duffles"
    | "Backpacks"
    | "Accessories";
  rating: number;
  reviews: number;
  sizes: string[];
  sizePrices?: Record<string, number>; // Optional size-specific offer prices
  sizeMrps?: Record<string, number>; // Optional size-specific MRPs
  isFeatured?: boolean;
  isNew?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "segno-4",
    name: "Segno 4.0",
    description:
      "The Segno 4.0 backpack is a durable and spacious option. Constructed from Dobby Polyester and 900 D Reverse PU, it offers 34L of storage with 3 compartments and 1 front pocket. This Executive Laptop Backpack is designed for the modern professional. Enjoy superior comfort with Tractum Suspension and Smart Sleeve. Secure your laptop in the lockable, detachable compartment. Stay organized with a hidden pocket and expandable design. Charge on the go with the USB port, and protect your gear with the included rain cover. Perfect for business travel and daily commutes.",
    price: 4000,
    mrp: 5000,
    image: require("@/assets/images/segno4.0.png"),
    category: "Backpacks",
    rating: 4.9,
    reviews: 12,
    sizes: ["34 L"],
    isFeatured: true,
    isNew: true,
  },
  {
    id: "airconic 2.0",
    name: "Airconic 2.0",
    description:
      "The revolutionary Airconic, our global bestseller is a superlight trolley bag for your fly-high travel tours! Would you believe that the large sized spinner in this series weighs only 3.2kg making it the most lightweight luggage set for complete travel ease. The slick design and superior finish in polypropylene looks brilliant in black, grey and formula red. The Pack Pro interiors with complimentary packing cubes ensure good luggage space along with dual packing straps for convenient packing. This iconic hardside luggage comes with a waterproof zipper, double wheels for swift & seamless movement as well as a complimentary luggage cover!",
    price: 5925,
    mrp: 7900,
    image: require("@/assets/images/airconic2.0.png"),
    category: "Hard Luggage",
    rating: 4.8,
    reviews: 124,
    sizes: ["55cm", "66cm", "77cm"],
    sizePrices: {
      "55cm": 5925,
      "66cm": 6787,
      "77cm": 8138,
    },
    sizeMrps: {
      "55cm": 7900,
      "66cm": 9050,
      "77cm": 10850,
    },
    isFeatured: true,
  },
  {
    id: "bern",
    name: "Bern",
    description:
      "The American Tourister Bern+ 60cm Cabin Spinner Suitcase is designed for modern travelers who seek functionality, security, and convenience in a sleek design. Made from durable and lightweight materials, this hardside suitcase offers ample storage with an expander feature, allowing extra packing space when needed. The TSA combination lock ensures secure travel, while the double wheels provide effortless mobility across all surfaces. For better organization, it comes with an attached wet pocket, ideal for storing toiletries or damp items separately. Whether for business trips or weekend getaways, the Bern+ 60cm Cabin Suitcase is a reliable travel companion. Backed by a 3-year international warranty, it guarantees long-lasting durability and peace of mind.",
    price: 4450,
    mrp: 8900,
    image: require("@/assets/images/bern.png"),
    category: "Soft Luggage",
    rating: 4.7,
    reviews: 89,
    sizes: ["60cm", "72cm", "84cm"],
    sizePrices: {
      "60cm": 4450,
      "72cm": 5250,
      "84cm": 6100,
    },
    sizeMrps: {
      "60cm": 8900,
      "72cm": 10500,
      "84cm": 12200,
    },
  },
  {
    id: "philly",
    name: "Philly",
    description:
      "The Philly+ 60cm Cabin Spinner Suitcase is a compact yet spacious travel companion, perfect for short trips and carry-on requirements. Designed with a durable hardside exterior, it offers enhanced protection while remaining lightweight. The expander function allows for extra packing space when needed, and the TSA combination lock ensures secure travel. With double wheels for smooth mobility and a built-in wet pocket for separating damp clothes or toiletries, this suitcase is ideal for business or leisure travel. Comes with a 3-year international warranty for worry-free trips.",
    price: 5580,
    mrp: 9300,
    image: require("@/assets/images/philly.png"),
    category: "Soft Luggage",
    rating: 4.9,
    reviews: 210,
    sizes: ["60", "70cm", "82cm"],
    sizePrices: {
      "60": 5580,
      "70cm": 6510,
      "82cm": 7380,
    },
    sizeMrps: {
      "60": 9300,
      "70cm": 10850,
      "82cm": 12300,
    },
  },
  {
    id: "brett",
    name: "Brett 4.0",
    description:
      "Experience elevated travel comfort with the American Tourister Brett 4.0 laptop carry bags, expertly designed for up to 15.4-inch laptops with ergonomic precision. Boasting Ergo-on-the-go back and shoulders for optimal support, three spacious compartments, and two zippered pockets for effortless organization, these bags seamlessly combine style and functionality. Crafted with eco-friendly Material lining, a protective rain cover, and a microfleece pocket for essentials like glasses, they ensure superior load-bearing capability and feature Air Groove Plus Technology for enhanced back mesh padding.",
    price: 2840,
    mrp: 3550,
    image: require("@/assets/images/brett.png"),
    category: "Backpacks",
    rating: 4.5,
    reviews: 56,
    sizes: ["34 L"],
  },
  {
    id: "memory",
    name: "Mermory Foam Pillow",
    description:
      "American Tourister offers a range of travel pillows designed for comfort and convenience on the go. Their travel pillows are made with high-quality materials such as soft fleece, memory foam, and microbeads that mold to the shape of your neck and provide support while you sleep. The pillows are lightweight and compact, making them easy to pack in your luggage or carry-on bag. They also come in various colors and designs to suit your personal style. Whether you're traveling by plane, car, or train, American Tourister travel pillows will help you arrive at your destination feeling rested and refreshed.",
    price: 1192,
    mrp: 1490,
    image: require("@/assets/images/pillow.png"),
    category: "Accessories",
    rating: 4.6,
    reviews: 78,
    sizes: ["31cm"],
  },
  {
    id: "foldable-backpack",
    name: "Foldable Backpack",
    description:
      "A foldable backpack that’s perfect as a travel accessory or an extra bag for sudden carry-on needs Made to fold down compactly when not in use saving space in your suitcase or luggage.",
    price: 1160,
    mrp: 1450,
    image: require("@/assets/images/foldable-backpack.png"),
    category: "Backpacks",
    rating: 4.6,
    reviews: 78,
    sizes: ["29cm"],
  },
  {
    id: "tsalock",
    name: "3 Dial TSA Combination Lock",
    description:
      "American Tourister offers a range of travel locks that provide security and peace of mind while traveling. These locks come in various sizes and styles, from cable locks to combination locks, all designed to secure your luggage from unwanted intruders. The locks are made with durable materials, such as zinc alloy, and are easy to use with straightforward instructions included. Some locks are TSA-approved, allowing TSA agents to open and inspect your luggage without damaging the lock. American Tourister's travel locks are an essential accessory for any traveler who values the security of their belongings during transit",
    price: 640,
    mrp: 800,
    image: require("@/assets/images/tsalock.png"),
    category: "Accessories",
    rating: 3.8,
    reviews: 4,
    sizes: ["3.2cm"],
  },
  {
    id: "astic",
    name: "ASTIC",
    description:
      "Spacious & Travel-Ready – Designed to hold travel essentials with ample capacity (e.g., around ~70 L for the larger 62 cm size) — great for weekend trips, gym, or travel adventures.",
    price: 1895,
    mrp: 3790,
    image: require("@/assets/images/astic.png"),
    category: "Duffles",
    rating: 4.9,
    reviews: 210,
    sizes: ["52cm", "62cm"],
    sizePrices: {
      "52cm": 1895,
      "62cm": 2085,
    },
    sizeMrps: {
      "52cm": 3790,
      "62cm": 4170,
    },
  },
];

export const CATEGORIES = [
  "All",
  "Hard Luggage",
  "Soft Luggage",
  "Duffles",
  "Backpacks",
  "Accessories",
];
