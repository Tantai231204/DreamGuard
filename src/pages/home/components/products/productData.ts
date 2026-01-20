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
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=450&fit=crop",
    rating: 5,
  },
  {
    id: 2,
    name: "Pillow",
    price: 16.0,
    image: "https://i.pinimg.com/736x/d9/20/af/d920afbda3da09bfcbbc2af9876dce2d.jpg",
  },
  {
    id: 3,
    name: "Blanket",
    price: 16.0,
    image: "https://i.pinimg.com/1200x/b1/3d/35/b13d3502877a91f5b1d734cb63c3c895.jpg",
    discount: 17,
  },
];

export type { Product };
