import { Route, Switch, Redirect } from "wouter";
import PhonicsApp from "./components/PhonicsApp";
import VocabApp from "./components/VocabApp";
import SentencesApp from "./components/SentencesApp";
import MyStory from "./pages/my-story";
import NotFound from "./pages/not-found";
import NumbersApp from "./components/NumbersApp";
import StoryPage from "./pages/StoryPage";

import { useEffect } from "react";

function App() {
  useEffect(() => {
    const requestFullscreen = () => {
      const docEl = document.documentElement;
      if (!document.fullscreenElement && docEl.requestFullscreen) {
        docEl.requestFullscreen()
          .then(() => {
            removeGestureListeners();
          })
          .catch((err) => {
            console.warn("Fullscreen request blocked or failed:", err);
          });
      }
    };

    const handleGesture = () => {
      requestFullscreen();
    };

    const addGestureListeners = () => {
      window.addEventListener('click', handleGesture, { passive: true });
      window.addEventListener('touchstart', handleGesture, { passive: true });
      window.addEventListener('pointerdown', handleGesture, { passive: true });
    };

    const removeGestureListeners = () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('pointerdown', handleGesture);
    };

    // 1. Attempt immediate fullscreen on load/open
    requestFullscreen();

    // 2. Add gesture listeners in case browser blocks immediate call
    addGestureListeners();

    // 3. Listen for fullscreen changes to clean up or re-engage
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        removeGestureListeners();
      } else {
        addGestureListeners();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      removeGestureListeners();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Switch>
      <Route path="/">{() => <Redirect to="/phonics" replace />}</Route>
      <Route path="/app">{() => <Redirect to="/phonics" replace />}</Route>
      <Route path="/phonics" component={PhonicsApp} />
      <Route path="/vocab/:category?" component={VocabApp} />
      <Route path="/sentences/:category?" component={SentencesApp} />
      <Route path="/numbers" component={NumbersApp} />

      <Route path="/my-story" component={MyStory} />
      <Route path="/story/:id" component={StoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
