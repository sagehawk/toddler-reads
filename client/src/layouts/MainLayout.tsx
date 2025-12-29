import { BackgroundAnimator } from "@/components/BackgroundAnimator";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <BackgroundAnimator />
      <main>
        {children}
      </main>
    </div>
  );
}

