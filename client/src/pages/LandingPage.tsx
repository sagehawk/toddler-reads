import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import logoUrl from '../assets/toddler-reads-logo.png';
// Using placeholders for images if they don't exist, or importing what we have
import landingHero from '../assets/landing.png'; 
import heroImg from '../assets/hero_img.jpg';

export default function LandingPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check for "login" session
    const session = localStorage.getItem("toddlerreads_session");
    if (session) {
      setLocation("/app");
    }
  }, [setLocation]);

  const handleStartTrial = () => {
    // For now, "starting trial" just logs them in
    localStorage.setItem("toddlerreads_session", "true");
    setLocation("/app");
  };

  return (
    <div className="min-h-screen font-nunito text-[#2D3748] bg-[#FFFAF0] overflow-x-hidden">
      {/* Background Letters */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-10">
        <span className="absolute top-10 left-10 text-9xl font-bold text-[#4FD1C5] -rotate-12">A</span>
        <span className="absolute top-1/3 right-20 text-9xl font-bold text-[#FC8181] rotate-12">B</span>
        <span className="absolute bottom-20 left-1/4 text-9xl font-bold text-[#F6AD55] -rotate-6">C</span>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <img src={logoUrl} alt="ToddlerReads" className="h-12 w-auto" />
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/my-story" className="text-[#2D3748] font-semibold hover:text-[#4FD1C5] transition-colors">
            My Story
          </Link>
          <button 
            onClick={handleStartTrial}
            className="bg-[#4FD1C5] text-white font-bold py-2.5 px-6 rounded-full shadow-lg hover:shadow-xl hover:bg-[#38B2AC] transform hover:-translate-y-0.5 transition-all"
          >
            Start Learning
          </button>
        </div>
        {/* Mobile Menu Button Placeholder */}
        <div className="md:hidden">
            <button onClick={handleStartTrial} className="text-[#4FD1C5] font-bold">Start</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 text-center md:text-left mb-12 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Don't just entertain them. <span className="text-[#4FD1C5]">Empower them.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
            The simple, parent-led system to give your child a 5-year head start by mastering phonics in just 5 minutes a day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <button 
              onClick={handleStartTrial}
              className="w-full sm:w-auto bg-[#4FD1C5] text-white text-lg font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:bg-[#38B2AC] transform hover:-translate-y-1 transition-all"
            >
              Start Learning Now
            </button>
            <p className="text-sm text-gray-500 mt-2 sm:mt-0">100% Free.</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md">
             {/* Abstract blob background for image */}
             <div className="absolute top-0 right-0 -mr-4 -mt-4 w-72 h-72 bg-[#4FD1C5] opacity-20 rounded-full blur-3xl"></div>
             <img 
               src={landingHero} 
               alt="ToddlerReads App on Phone" 
               className="relative z-10 w-full h-auto drop-shadow-2xl rounded-3xl transform rotate-3 hover:rotate-0 transition-transform duration-500" 
             />
          </div>
        </div>
      </header>

      {/* Social Proof Bar */}
      <div className="relative z-10 bg-white py-8 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 font-semibold uppercase tracking-wider text-sm mb-4">Trusted by over 1,000 Founding Families</p>
            <div className="flex justify-center gap-2">
                 {/* Star rating placeholder */}
                 {[1,2,3,4,5].map(i => (
                     <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                 ))}
            </div>
        </div>
      </div>

      {/* Founder Story Section */}
      <section className="relative z-10 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="w-full md:w-1/2 order-2 md:order-1">
                    <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl">
                        <img src={heroImg} alt="Founder" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="w-full md:w-1/2 order-1 md:order-2">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">"From a Father Who Was Left Behind..."</h2>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                        I struggled with reading my whole life. I built ToddlerReads to ensure my son had the confident start I never did. We turned a complex process into a simple, joyful daily habit.
                    </p>
                    <Link href="/my-story" className="text-[#4FD1C5] font-bold text-lg hover:underline decoration-2 underline-offset-4">
                        Read our full story &rarr;
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-20 bg-[#FFFAF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16">More learning, less shucking.</h2>
            
            <div className="grid md:grid-cols-3 gap-12">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-6 text-3xl">🚀</div>
                    <h3 className="text-xl font-bold mb-3">Start a Session</h3>
                    <p className="text-gray-600">Launch a guided lesson in seconds. No complex menus, no distractions.</p>
                </div>
                 {/* Step 2 */}
                 <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-6 text-3xl">🧩</div>
                    <h3 className="text-xl font-bold mb-3">Guide Their Discovery</h3>
                    <p className="text-gray-600">Use our simple Drill Mode and Magic Letter Tray to practice the exact sounds your child needs.</p>
                </div>
                 {/* Step 3 */}
                 <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-6 text-3xl">🎉</div>
                    <h3 className="text-xl font-bold mb-3">Reinforce with Play</h3>
                    <p className="text-gray-600">Switch to our calm, automated Play Mode for guilt-free practice while you get things done.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 bg-[#2D3748] text-white text-center">
         <div className="max-w-4xl mx-auto px-4">
             <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to give your child a head start?</h2>
             <p className="text-xl text-gray-300 mb-10">Join thousands of parents building confident readers today.</p>
             <button 
               onClick={handleStartTrial}
               className="bg-[#4FD1C5] text-white text-xl font-bold py-5 px-10 rounded-full shadow-lg hover:shadow-xl hover:bg-[#38B2AC] transform hover:-translate-y-1 transition-all"
             >
               Start Learning Now
             </button>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center">
                  <img src={logoUrl} alt="ToddlerReads" className="h-8 w-auto grayscale opacity-70 hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-gray-500 font-medium">
                  Get started and see the progress.
              </div>
              <div className="flex gap-6 text-gray-500 text-sm">
                  <a href="#" className="hover:text-[#4FD1C5]">About</a>
                  <a href="#" className="hover:text-[#4FD1C5]">Privacy</a>
                  <a href="#" className="hover:text-[#4FD1C5]">Terms</a>
                  <a href="#" className="hover:text-[#4FD1C5]">Contact</a>
              </div>
          </div>
      </footer>
    </div>
  );
}
