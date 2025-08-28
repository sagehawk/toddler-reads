import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
