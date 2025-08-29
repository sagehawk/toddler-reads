import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}
