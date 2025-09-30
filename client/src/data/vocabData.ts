import antImage from '../assets/animals/ant.png';
import appleImage from '../assets/animals/apple.png';
import ballImage from '../assets/animals/ball.png';
import boxImage from '../assets/animals/box.png';
import catImage from '../assets/animals/cat.png';
import cowImage from '../assets/animals/cow.png';
import dogImage from '../assets/animals/dog.png';
import duckImage from '../assets/animals/duck.png';
import eggImage from '../assets/animals/egg.png';
import elephantImage from '../assets/animals/elephant.png';
import fishImage from '../assets/animals/fish.png';
import goatImage from '../assets/animals/goat.png';
import hatImage from '../assets/animals/hat.png';
import iceImage from '../assets/animals/ice.png';
import inkImage from '../assets/animals/ink.png';
import juiceImage from '../assets/animals/juice.png';
import keyImage from '../assets/animals/key.png';
import lionImage from '../assets/animals/lion.png';
import moonImage from '../assets/animals/moon.png';
import nestImage from '../assets/animals/nest.png';
import orangeImage from '../assets/animals/orange.png';
import pandaImage from '../assets/animals/panda.png';
import pizzaImage from '../assets/animals/pizza.png';
import quackImage from '../assets/animals/quack.png';
import rabbitImage from '../assets/animals/rabbit.png';
import sunImage from '../assets/animals/sun.png';
import tigerImage from '../assets/animals/tiger.png';
import turtleImage from '../assets/animals/turtle.png';
import umbrellaImage from '../assets/animals/umbrella.png';
import vacuumImage from '../assets/animals/vacuum.png';
import watermelonImage from '../assets/animals/watermelon.png';
import yogurtImage from '../assets/animals/yogurt.png';
import zebraImage from '../assets/animals/zebra.png';

export interface VocabItem {
  name: string;
  image: string;
  tts?: string;
}

export const vocabData: VocabItem[] = [
  { name: 'Ant', image: antImage },
  { name: 'Apple', image: appleImage },
  { name: 'Ball', image: ballImage },
  { name: 'Box', image: boxImage },
  { name: 'Cat', image: catImage },
  { name: 'Cow', image: cowImage },
  { name: 'Dog', image: dogImage },
  { name: 'Duck', image: duckImage },
  { name: 'Egg', image: eggImage },
  { name: 'Elephant', image: elephantImage },
  { name: 'Fish', image: fishImage },
  { name: 'Goat', image: goatImage },
  { name: 'Hat', image: hatImage },
  { name: 'Ice', image: iceImage },
  { name: 'Ink', image: inkImage },
  { name: 'Juice', image: juiceImage },
  { name: 'Key', image: keyImage },
  { name: 'Lion', image: lionImage },
  { name: 'Moon', image: moonImage },
  { name: 'Nest', image: nestImage },
  { name: 'Orange', image: orangeImage },
  { name: 'Panda', image: pandaImage },
  { name: 'Pizza', image: pizzaImage },
  { name: 'Quack', image: quackImage },
  { name: 'Rabbit', image: rabbitImage },
  { name: 'Sun', image: sunImage },
  { name: 'Tiger', image: tigerImage },
  { name: 'Turtle', image: turtleImage },
  { name: 'Umbrella', image: umbrellaImage },
  { name: 'Vacuum', image: vacuumImage },
  { name: 'Watermelon', image: watermelonImage },
  { name: 'Yogurt', image: yogurtImage },
  { name: 'Zebra', image: zebraImage, tts: 'Zeebra' },
];
