import { Route, Switch, Redirect } from "wouter";
import PhonicsApp from "./components/PhonicsApp";
import VocabApp from "./components/VocabApp";
import SentencesApp from "./components/SentencesApp";
import MyStory from "./pages/my-story";
import NotFound from "./pages/not-found";
import NumbersApp from "./components/NumbersApp";
import DoodleApp from "./components/DoodleApp";
import StoryPage from "./pages/StoryPage";
import Dashboard from "./pages/Dashboard";

import { useEffect } from "react";
import { preloadAllAudio } from "./lib/audioPreloader";

function App() {
  useEffect(() => {
    // Preload all phonics MP3 files into browser cache for instant playback
    preloadAllAudio();

    const requestFullscreen = () => {
      const docEl = document.documentElement;
      if (!document.fullscreenElement && docEl.requestFullscreen) {
        docEl.requestFullscreen()
          .catch((err) => {
            console.warn("Fullscreen request blocked or failed:", err);
          });
      }
    };

    const handleGesture = () => {
      requestFullscreen();
    };

    // Block the right-click / long-press context menu app-wide so toddlers
    // can't pop up "Save image", "Reload", etc. and get stuck.
    const blockContextMenu = (e: Event) => e.preventDefault();

    // Keep listeners active at all times so ANY tap engages fullscreen immediately
    window.addEventListener('click', handleGesture, { passive: true });
    window.addEventListener('touchstart', handleGesture, { passive: true });
    window.addEventListener('pointerdown', handleGesture, { passive: true });
    window.addEventListener('contextmenu', blockContextMenu);

    // Initial attempt on load
    requestFullscreen();

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('contextmenu', blockContextMenu);
    };
  }, []);

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/app" component={Dashboard} />
      <Route path="/phonics" component={PhonicsApp} />
      <Route path="/vocab/:category?" component={VocabApp} />
      <Route path="/sentences/:category?" component={SentencesApp} />
      <Route path="/numbers" component={NumbersApp} />
      <Route path="/doodle" component={DoodleApp} />

      <Route path="/my-story" component={MyStory} />
      <Route path="/story/:id" component={StoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
