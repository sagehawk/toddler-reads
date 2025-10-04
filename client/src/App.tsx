import { Route, Switch } from "wouter";
import NewLanding from "./pages/NewLanding";
import PhonicsApp from "./components/PhonicsApp";
import VocabApp from "./components/VocabApp";
import SentencesApp from "./components/SentencesApp";
import MyStory from "./pages/my-story";
import NotFound from "./pages/not-found";

function App() {
  return (
    <Switch>
      <Route path="/" component={NewLanding} />
      <Route path="/phonics" component={PhonicsApp} />
      <Route path="/vocab/:category?" component={VocabApp} />
      <Route path="/sentences/:category?" component={SentencesApp} />
      <Route path="/my-story" component={MyStory} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
