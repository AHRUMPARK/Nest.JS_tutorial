import { Inter, Lusitana } from "next/font/google";

export const inter = Inter({ subsets: ["latin"], preload: true });

export const lusitana = Lusitana({
  weight: ["400", "700"],
  subsets: ["latin"],
  preload: true,
});

// .lusitana-regular {
//   font-family: "Lusitana", serif;
//   font-weight: 400;
//   font-style: normal;
// }

// .lusitana-bold {
//   font-family: "Lusitana", serif;
//   font-weight: 700;
//   font-style: normal;
// }
