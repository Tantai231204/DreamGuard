interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating?: number;
  discount?: number;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Mattress",
    price: 16.0,
    image: "src/assets/images/product1.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "Pillow",
    price: 16.0,
    image: "src/assets/images/product2.jpg",
  },
  {
    id: 3,
    name: "Blanket",
    price: 16.0,
    image: "src/assets/images/product3.jpg",
    discount: 17,
  },
];

export type { Product };
