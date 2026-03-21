import { HotelLayout } from "@/components/layouts/HotelLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <HotelLayout>{children}</HotelLayout>;
}
