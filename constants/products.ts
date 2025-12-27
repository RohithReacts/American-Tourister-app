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
    | "Kids"
    | "Accessories"
    | "Office";
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
    id: "segno-4-blue",
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
    image: require("@/assets/images/travelpillow.png"),
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
  {
    id: "covo",
    name: "Covo",
    description:
      "Gym, Zumba or even last minute cabin luggage, the list is endless when it comes to using COVO - our dobby polyester non-wheeled duffle bag. COVO not only comes with spacious side pockets, making it perfect for carrying shoes and gym accessories, but its detachable shoulder strap and grab handle define the 'grab-and-go' lifestyle. On top of that, its inner mesh zippered pocket and outer pockets ensure that all your essentials have a place so that finding them doesn't become a hassle. If you still need more convincing, then the 1-year international warranty on COVO will surely seal the deal!",
    price: 1680,
    mrp: 2100,
    image: require("@/assets/images/covo.jpg"),
    category: "Duffles",
    rating: 4.9,
    reviews: 210,
    sizes: ["52cm"],
    sizePrices: {
      "52cm": 1680,
    },
    sizeMrps: {
      "52cm": 2100,
    },
  },
  {
    id: "leatus",
    name: "Leatus",
    description:
      "Leatus is our fashion-forward full-body twill fabric non-wheeled duffle that exudes elegance. This duffle with its trendy and comes with a 1-year international warranty, a detachable shoulder strap, fully lined interiors, and a front zippered pocket. No wonder Leatus is the ultimate duffle bag for your travel sojourns!",
    price: 1960,
    mrp: 2450,
    image: require("@/assets/images/leatus.jpg"),
    category: "Duffles",
    rating: 4.9,
    reviews: 210,
    sizes: ["45cm"],
    sizePrices: {
      "45cm": 1960,
    },
    sizeMrps: {
      "45cm": 2450,
    },
  },
  {
    id: "siesta",
    name: "Siesta",
    description:
      "The American Tourister Siesta Duffle Bag is a perfect combination of simplicity, strength, and style. Crafted with high-quality fabric, it offers long-lasting durability while remaining lightweight for easy carrying.",
    price: 1149.75,
    mrp: 1533,
    image: require("@/assets/images/siesta.jpg"),
    category: "Duffles",
    rating: 4.9,
    reviews: 210,
    sizes: ["52cm"],
    sizePrices: {
      "52cm": 1149.75,
    },
    sizeMrps: {
      "52cm": 1533,
    },
  },
  {
    id: "flex",
    name: "Flex",
    description:
      "Travel smart with the American Tourister Flex Duffle Bag, designed for comfort, durability, and modern style. Made from premium quality polyester fabric, this duffle is lightweight yet strong enough to handle daily use, gym workouts, and short trips.",
    price: 1350,
    mrp: 1800,
    image: require("@/assets/images/flex.jpg"),
    category: "Duffles",
    rating: 4.9,
    reviews: 210,
    sizes: ["52cm"],
    sizePrices: {
      "52cm": 1350,
    },
    sizeMrps: {
      "52cm": 1800,
    },
  },
  {
    id: "fastforward",
    name: "Fast Forward",
    description:
      "Travel smart with the American Tourister Fastword 55cm Cabin Luggage, designed to meet most airline cabin size regulations. Crafted with a durable hardside shell, this compact spinner offers double wheels for smooth gliding, a TSA combination lock for secure travel, and an expander for extra packing space when needed. Its lightweight structure makes it ideal for short getaways or business trips, while the sleek design keeps you stylish on the move. Comes with a 3-year international warranty for added peace of mind.",
    price: 4750.2,
    mrp: 7917,
    image: require("@/assets/images/fastforward.jpg"),
    category: "Hard Luggage",
    rating: 4.9,
    reviews: 210,
    sizes: ["55cm", "68cm", "78cm"],
    sizePrices: {
      "55cm": 4750.2,
      "68cm": 5940,
      "78cm": 7099.8,
    },
    sizeMrps: {
      "55cm": 7917,
      "68cm": 9900,
      "78cm": 11833,
    },
  },
  {
    id: "diamo",
    name: "Diamo",
    description:
      "The American Tourister Diamo 55cm Cabin Spinner is a perfect blend of style and practicality for short trips and weekend getaways. Designed with a distinctive groove pattern, it adds a modern, fashionable edge to your travel look. Equipped with smooth double wheels for effortless movement, a secure TSA combination lock, and multiple internal pockets, this compact suitcase makes organizing essentials a breeze. Its vibrant color options add a touch of personality, while the 3-year international warranty offers reliable peace of mind on every adventure.",
    price: 3490,
    mrp: 6980,
    image: require("@/assets/images/diamo.jpg"),
    category: "Hard Luggage",
    rating: 4.9,
    reviews: 210,
    sizes: ["55cm", "77cm"],
    sizePrices: {
      "55cm": 3490,

      "77cm": 5100,
    },
    sizeMrps: {
      "55cm": 6980,

      "77cm": 10200,
    },
  },
  {
    id: "elbrus",
    name: "Elbrus",
    description:
      "The Elbrus+ 55cm Cabin Spinner is a sleek and durable carry-on designed for short trips and hassle-free travel. Crafted with a sturdy hardside shell, it ensures superior protection while remaining lightweight. The expander feature provides extra packing space when needed, while the TSA combination lock enhances security. Its double wheels offer smooth 360° maneuverability, making it easy to navigate through airports and city streets. Designed for style and functionality, this suitcase is backed by a 3-year international warranty for long-lasting reliability.",
    price: 4440,
    mrp: 7400,
    image: require("@/assets/images/elbrus.jpg"),
    category: "Hard Luggage",
    rating: 4.9,
    reviews: 210,
    sizes: ["55cm", "68cm", "79cm"],
    sizePrices: {
      "55cm": 4440,
      "68cm": 5400,
      "79cm": 6480,
    },
    sizeMrps: {
      "55cm": 7400,
      "68cm": 9000,
      "79cm": 10800,
    },
  },
  {
    id: "circurity +",
    name: "Circurity +",
    description:
      "Introducing Circurity, the ultimate travel companion. Our cutting-edge 3-point lock hardside luggage, crafted with durable polypropylene, ensures your belongings stay secure. Maneuver with ease, thanks to the smooth double wheels, making every journey a breeze. Plus, choose from three stunning colors to reflect your style. Elevate your travel experience with Circurity – where innovation meets style. Travel smarter, travel Circurity.",
    price: 4290,
    mrp: 8580,
    image: require("@/assets/images/circurity.jpg"),
    category: "Hard Luggage",
    rating: 4.9,
    reviews: 210,
    sizes: ["55cm", "68cm", "78cm"],
    sizePrices: {
      "55cm": 4290,
      "68cm": 5200,
      "78cm": 6200,
    },
    sizeMrps: {
      "55cm": 8580,
      "68cm": 10400,
      "78cm": 12400,
    },
  },
  {
    id: "alcove",
    name: "Alcove",
    description:
      "The Alcove+ 56cm Cabin Spinner is a sleek and compact travel companion, ideal for short trips and business travel. Featuring a durable hardside shell, it offers excellent protection while remaining lightweight. The PlentiVol 20:80 book opening concept provides maximum packing space, making organization effortless. Shock lock wheels ensure smooth maneuverability, while the TSA combination lock adds extra security. Whether for a weekend getaway or a business trip, this suitcase offers style, functionality, and reliability, backed by a 3-year international warranty.",
    price: 5070,
    mrp: 8450,
    image: require("@/assets/images/alcove.jpg"),
    category: "Hard Luggage",
    rating: 4.9,
    reviews: 10,
    sizes: ["55cm", "67cm", "77cm"],
    sizePrices: {
      "55cm": 5070,
      "67cm": 6360,
      "77cm": 7650,
    },
    sizeMrps: {
      "55cm": 8450,
      "67cm": 10600,
      "77cm": 12750,
    },
  },
  {
    id: "skiddle",
    name: "Skiddle",
    description:
      "The American Tourister Skiddle 39.5cm Small Suitcase is designed especially for kids, combining fun, functionality, and security in a compact size. Crafted with a durable hardside shell, this suitcase features playful and unique designs that appeal to both boys and girls, making travel exciting. The 2-point lock system ensures added security, keeping belongings safe while on the go. Designed for effortless maneuverability, the suitcase is equipped with smooth double wheels that glide easily across various surfaces, making it easy for kids to handle. Its compact size is perfect for short trips, school excursions, or family vacations. Backed by a 3-year international warranty, the Skiddle suitcase ensures long-lasting durability and reliability, giving parents peace of mind while kids enjoy their travel adventures.",
    price: 2850.05,
    mrp: 3353,
    image: require("@/assets/images/kid.jpg"),
    category: "Kids",
    rating: 4.9,
    reviews: 10,
    sizes: ["40cm"],
    sizePrices: {
      "40cm": 2850.05,
    },
    sizeMrps: {
      "40cm": 3353,
    },
  },
  {
    id: "the smurfs",
    name: "The Smurfs",
    description:
      "Let your child travel in style with the American Tourister x The Smurfs 53cm Kids Luggage, a playful and practical suitcase inspired by the beloved Smurfs characters. Designed especially for young globetrotters, this fun-sized hardside luggage features vibrant Smurfs-themed graphics, making every trip feel like an adventure. The durable and lightweight build ensures easy handling for kids, while the 53cm cabin-friendly size is perfect for vacations, school trips, or family getaways. With smooth-rolling wheels, a comfortable top handle, and a secure closure system, it’s made for convenience. Backed by a 3-year international warranty, this licensed collaboration adds a splash of imagination to every journey.",
    price: 3920,
    mrp: 4900,
    image: require("@/assets/images/kid1.jpg"),
    category: "Kids",
    rating: 4.9,
    reviews: 10,
    sizes: ["53cm"],
    sizePrices: {
      "53cm": 3920,
    },
    sizeMrps: {
      "53cm": 4900,
    },
  },
  {
    id: "segno-4-grey",
    name: "Segno 4.0",
    description:
      "The Segno 4.0 backpack is a durable and spacious option. Constructed from Dobby Polyester and 900 D Reverse PU, it offers 34L of storage with 3 compartments and 1 front pocket. This Executive Laptop Backpack is designed for the modern professional. Enjoy superior comfort with Tractum Suspension and Smart Sleeve. Secure your laptop in the lockable, detachable compartment. Stay organized with a hidden pocket and expandable design. Charge on the go with the USB port, and protect your gear with the included rain cover. Perfect for business travel and daily commutes.",
    price: 3840,
    mrp: 4800,
    image: require("@/assets/images/segno2.0.jpg"),
    category: "Backpacks",
    rating: 4.9,
    reviews: 10,
    sizes: ["34 L"],
    sizePrices: {
      "34 L": 3840,
    },
    sizeMrps: {
      "34 L": 4800,
    },
  },
  {
    id: "segno-4-black",
    name: "Segno 4.0",
    description:
      "The Segno 4.0 backpack is a durable and spacious option. Constructed from Dobby Polyester and 900 D Reverse PU, it offers 34L of storage with 3 compartments and 1 front pocket. This Executive Laptop Backpack is designed for the modern professional. Enjoy superior comfort with Tractum Suspension and Smart Sleeve. Secure your laptop in the lockable, detachable compartment. Stay organized with a hidden pocket and expandable design. Charge on the go with the USB port, and protect your gear with the included rain cover. Perfect for business travel and daily commutes.",
    price: 4080,
    mrp: 5100,
    image: require("@/assets/images/segno2.0.2.jpg"),
    category: "Backpacks",
    rating: 4.9,
    reviews: 10,
    sizes: ["34 L"],
    sizePrices: {
      "34 L": 4080,
    },
    sizeMrps: {
      "34 L": 5100,
    },
  },
  {
    id: "segno-2-basic",
    name: "Segno 2.0",
    description:
      "The Segno 2.0 range comes in 4 thoughtfully designed trendy styles - Basic, EXpandable, Detachable, and 2 Way. Made with Dobby polyester RecycleXTM material technology, every Segno 2.0, regardless of the style, comes with some standard features - 3 full compartments, a 34.5-litres volume, Ergo-on-the-go back and shoulders, a lockable laptop compartment, USB port, smart sleeve, cable pouch, and a side bottle pocket. While Segno Basic has all these features, Segno EXpandable comes with an additional eXpander feature, Segno Detachable with a detachable laptop sleeve, and Segno 2 Way can be carried both horizontally and vertically. It’s time to make the Segno 2.0 your go-to eXecutive bag!",
    price: 4320,
    mrp: 5400,
    image: require("@/assets/images/segno2.0.1.jpg"),
    category: "Backpacks",
    rating: 4.9,
    reviews: 10,
    sizes: ["33 L"],
    sizePrices: {
      "33 L": 4320,
    },
    sizeMrps: {
      "33 L": 5400,
    },
  },
  {
    id: "brett 3.0",
    name: "Brett 3.0",
    description:
      "Experience elevated travel comfort with the American Tourister Brett 3.0 laptop carry bags, expertly designed for up to 15.4-inch laptops with ergonomic precision. Boasting Ergo-on-the-go back and shoulders for optimal support, three spacious compartments, and two zippered pockets for effortless organization, these bags seamlessly combine style and functionality. Crafted with eco-friendly Recyclex™ Fabric Material lining, a protective rain cover, and a microfleece pocket for essentials like glasses, they ensure superior load-bearing capability and feature Air Groove Plus Technology for enhanced back mesh padding.",
    price: 2800,
    mrp: 3500,
    image: require("@/assets/images/breeths.jpg"),
    category: "Backpacks",
    rating: 4.9,
    reviews: 10,
    sizes: ["30.5 L"],
    sizePrices: {
      "30.5 L": 2800,
    },
    sizeMrps: {
      "30.5 L": 3500,
    },
  },
  {
    id: "memory pillow-1",
    name: "Memory Foam Pillow",
    description:
      "American Tourister offers a range of travel pillows designed for comfort and convenience on the go. Their travel pillows are made with high-quality materials such as soft fleece, memory foam, and microbeads that mold to the shape of your neck and provide support while you sleep. The pillows are lightweight and compact, making them easy to pack in your luggage or carry-on bag. They also come in various colors and designs to suit your personal style. Whether you're traveling by plane, car, or train, American Tourister travel pillows will help you arrive at your destination feeling rested and refreshed.",
    price: 1192,
    mrp: 1490,
    image: require("@/assets/images/pillow.png"),
    category: "Accessories",
    rating: 4.9,
    reviews: 10,
    sizes: ["31cm"],
    sizePrices: {
      "31cm": 1192,
    },
    sizeMrps: {
      "31cm": 1490,
    },
  },
  {
    id: "3 dial lock",
    name: "3 Dial Combination Lock",
    description:
      "American Tourister offers a range of travel locks that provide security and peace of mind while traveling. These locks come in various sizes and styles, from cable locks to combination locks, all designed to secure your luggage from unwanted intruders. The locks are made with durable materials, such as zinc alloy, and are easy to use with straightforward instructions included. Some locks are TSA-approved, allowing TSA agents to open and inspect your luggage without damaging the lock. American Tourister's travel locks are an essential accessory for any traveler who values the security of their belongings during transit",
    price: 360,
    mrp: 450,
    image: require("@/assets/images/lock1.png"),
    category: "Accessories",
    rating: 4.9,
    reviews: 10,
    sizes: ["3.2cm"],
    sizePrices: {
      "3.2cm": 360,
    },
    sizeMrps: {
      "3.2cm": 450,
    },
  },
  {
    id: "activair",
    name: "Activair",
    description:
      "When you're spotted donning the American Tourister Activair, everyone will know that you mean business. One of our finest laptop bags for men or women no bar, Activair with its soft grip handle, detachable shoulder strap and smart sleeve lets you take charge. That's not all, this dobby polyester bag comes with a front pocket exclusively designed for pro-organisation, and separate cable and tablet pockets, so you save time wherever you go!",
    price: 3360,
    mrp: 4200,
    image: require("@/assets/images/office2.png"),
    category: "Office",
    rating: 4.9,
    reviews: 10,
    sizes: ["40cm"],
    sizePrices: {
      "40cm": 3360,
    },
    sizeMrps: {
      "40cm": 4200,
    },
  },
  {
    id: "paisley",
    name: "Paisley",
    description:
      "Designed for the modern professional, the American Tourister Paisley Joy Briefcase blends clean aesthetics with smart functionality. It features a dedicated 15.6 inch laptop compartment, organized interiors, and a recycled lining that supports more responsible choices. The smart sleeve makes it easy to slide over trolley handles for business travel, while the detachable shoulder strap allows you to carry it your way. Whether commuting to the office or flying for meetings, this briefcase offers structure, style, and confidence. Backed by a 1-year international warranty.",
    price: 2320,
    mrp: 2900,
    image: require("@/assets/images/office.png"),
    category: "Office",
    rating: 4.9,
    reviews: 10,
    sizes: ["38cm"],
    sizePrices: {
      "38cm": 2320,
    },
    sizeMrps: {
      "38cm": 2900,
    },
  },
  {
    id: "3 dial cable lock",
    name: "3 Dial Combination Cable Lock",
    description:
      "American Tourister offers a range of travel locks that provide security and peace of mind while traveling. These locks come in various sizes and styles, from cable locks to combination locks, all designed to secure your luggage from unwanted intruders. The locks are made with durable materials, such as zinc alloy, and are easy to use with straightforward instructions included. Some locks are TSA-approved, allowing TSA agents to open and inspect your luggage without damaging the lock. American Tourister's travel locks are an essential accessory for any traveler who values the security of their belongings during transit",
    price: 392,
    mrp: 490,
    image: require("@/assets/images/lock3.png"),
    category: "Accessories",
    rating: 4.9,
    reviews: 10,
    sizes: ["3.7cm"],
    sizePrices: {
      "3.7cm": 392,
    },
    sizeMrps: {
      "3.7cm": 490,
    },
  },
];

export const CATEGORIES = [
  "All",
  "Hard Luggage",
  "Soft Luggage",
  "Duffles",
  "Backpacks",
  "Kids",
  "Accessories",
  "Office",
];
