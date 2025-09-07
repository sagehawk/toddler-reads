import { Route, Switch } from "wouter";
import NewLanding from "./pages/NewLanding";
import PhonicsApp from "./components/PhonicsApp";
import AnimalsApp from "./components/AnimalsApp"; // Import AnimalsApp
import MyStory from "./pages/my-story";
import NotFound from "./pages/not-found";

function App() {
  return (
    <Switch>
      <Route path="/" component={NewLanding} />
      <Route path="/phonics" component={PhonicsApp} />
      <Route path="/animals" component={AnimalsApp} /> {/* Add animals route */}
      <Route path="/my-story" component={MyStory} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;