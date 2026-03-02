import { Route, Switch, useLocation, Redirect } from "wouter";
import LandingPage from "./pages/LandingPage";
import PhonicsApp from "./components/PhonicsApp";
import VocabApp from "./components/VocabApp";
import SentencesApp from "./components/SentencesApp";
import MyStory from "./pages/my-story";
import NotFound from "./pages/not-found";
import NumbersApp from "./components/NumbersApp";
import StoryPage from "./pages/StoryPage";
import SandboxPage from "./pages/SandboxPage";
import { LandscapeEnforcer } from "./components/LandscapeEnforcer";
import { useEffect } from "react";

function App() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Optional: Add global listeners if needed, but removing the auto-redirect on fullscreen exit.
  }, [location, setLocation]);

  return (
    <LandscapeEnforcer>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/app">{() => <Redirect to="/sandbox" replace />}</Route>
        <Route path="/phonics" component={PhonicsApp} />
        <Route path="/vocab/:category?" component={VocabApp} />
        <Route path="/sentences/:category?" component={SentencesApp} />
        <Route path="/numbers" component={NumbersApp} />
        <Route path="/sandbox" component={SandboxPage} />
        <Route path="/my-story" component={MyStory} />
        <Route path="/story/:id" component={StoryPage} />
        <Route component={NotFound} />
      </Switch>
    </LandscapeEnforcer>
  );
}

export default App;
