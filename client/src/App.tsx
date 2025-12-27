import { Route, Switch } from "wouter";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import PhonicsApp from "./components/PhonicsApp";
import VocabApp from "./components/VocabApp";
import SentencesApp from "./components/SentencesApp";
import MyStory from "./pages/my-story";
import NotFound from "./pages/not-found";
import NumbersApp from "./components/NumbersApp";
import StoryPage from "./pages/StoryPage";

function App() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/app" component={Dashboard} />
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
