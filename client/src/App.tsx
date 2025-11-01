import { Route, Switch } from "wouter";
import { Analytics } from "@vercel/analytics/react";
import NewLanding from "./pages/NewLanding";
import PhonicsApp from "./components/PhonicsApp";
import VocabApp from "./components/VocabApp";
import SentencesApp from "./components/SentencesApp";
import MyStory from "./pages/my-story";
import NotFound from "./pages/not-found";
import NumbersApp from "./components/NumbersApp";

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={NewLanding} />
        <Route path="/phonics" component={PhonicsApp} />
      <Route path="/vocab/:category?" component={VocabApp} />
      <Route path="/sentences/:category?" component={SentencesApp} />
      <Route path="/numbers" component={NumbersApp} />
      <Route path="/my-story" component={MyStory} />
      <Route component={NotFound} />
    </Switch>
    <Analytics />
    </>
  );
}

export default App;
