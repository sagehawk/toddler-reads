import appleImage from '../assets/animals/apple.png';
import ballImage from '../assets/animals/ball.png';
import hatImage from '../assets/animals/hat.png';
import keyImage from '../assets/animals/key.png';
import boxImage from '../assets/animals/box.png';
import cupImage from '../assets/animals/cup.png';
import bedImage from '../assets/animals/bed.png';
import toyImage from '../assets/animals/toy.png';
import penImage from '../assets/animals/pen.png';
import bagImage from '../assets/animals/bag.png';
import juiceImage from '../assets/animals/juice.png';
import pizzaImage from '../assets/animals/pizza.png';
import yogurtImage from '../assets/animals/yogurt.png';
import orangeImage from '../assets/animals/orange.png';
import watermelonImage from '../assets/animals/watermelon.png';
import sunImage from '../assets/animals/sun.png';
import moonImage from '../assets/animals/moon.png';
import nestImage from '../assets/animals/nest.png';
import treeImage from '../assets/animals/tree.png';
import rockImage from '../assets/animals/rock.png';
import logImage from '../assets/animals/log.png';
import carImage from '../assets/animals/car.png';
import busImage from '../assets/animals/bus.png';
import vanImage from '../assets/animals/van.png';
import jetImage from '../assets/animals/jet.png';
import boatImage from '../assets/animals/boat.png';
import bikeImage from '../assets/animals/bike.png';
import trainImage from '../assets/animals/train.png';

import momImage from '../assets/animals/mom.png';
import dadImage from '../assets/animals/dad.png';
import kidImage from '../assets/animals/kid.png';
import manImage from '../assets/animals/man.png';
import catImage from '../assets/animals/cat.png';
import dogImage from '../assets/animals/dog.png';
import fishImage from '../assets/animals/fish.png';
import goatImage from '../assets/animals/goat.png';
import lionImage from '../assets/animals/lion.png';
import rabbitImage from '../assets/animals/rabbit.png';
import turtleImage from '../assets/animals/turtle.png';
import zebraImage from '../assets/animals/zebra.png';
import pandaImage from '../assets/animals/panda.png';
import henImage from '../assets/animals/hen.png';
import cowImage from '../assets/animals/cow.png';
import duckImage from '../assets/animals/duck.png';
import ratImage from '../assets/animals/rat.png';
import batImage from '../assets/animals/bat.png';

export interface VocabItem {
  name: string;
  image: string;
  category: string;
  tts?: string;
}

export const vocabData: VocabItem[] = [
  { name: 'Cat', image: catImage, category: 'Animals' },
  { name: 'Dog', image: dogImage, category: 'Animals' },
  { name: 'Fish', image: fishImage, category: 'Animals' },
  { name: 'Goat', image: goatImage, category: 'Animals' },
  { name: 'Lion', image: lionImage, category: 'Animals' },
  { name: 'Rabbit', image: rabbitImage, category: 'Animals' },
  { name: 'Turtle', image: turtleImage, category: 'Animals' },
  { name: 'Zebra', image: zebraImage, category: 'Animals', tts: 'Zeebra' },
  { name: 'Panda', image: pandaImage, category: 'Animals' },
  { name: 'Hen', image: henImage, category: 'Animals' },
  { name: 'Cow', image: cowImage, category: 'Animals' },
  { name: 'Duck', image: duckImage, category: 'Animals' },
  { name: 'Rat', image: ratImage, category: 'Animals' },
  { name: 'Bat', image: batImage, category: 'Animals' },
  { name: 'Apple', image: appleImage, category: 'Things' },
  { name: 'Ball', image: ballImage, category: 'Things' },
  { name: 'Hat', image: hatImage, category: 'Things' },
  { name: 'Key', image: keyImage, category: 'Things' },
  { name: 'Box', image: boxImage, category: 'Things' },
  { name: 'Cup', image: cupImage, category: 'Things' },
  { name: 'Bed', image: bedImage, category: 'Things' },
  { name: 'Toy', image: toyImage, category: 'Things' },
  { name: 'Pen', image: penImage, category: 'Things' },
  { name: 'Bag', image: bagImage, category: 'Things' },
  { name: 'Juice', image: juiceImage, category: 'Things' },
  { name: 'Pizza', image: pizzaImage, category: 'Things' },
  { name: 'Yogurt', image: yogurtImage, category: 'Things' },
  { name: 'Orange', image: orangeImage, category: 'Things' },
  { name: 'Watermelon', image: watermelonImage, category: 'Things' },
  { name: 'Sun', image: sunImage, category: 'Nature' },
  { name: 'Moon', image: moonImage, category: 'Nature' },
  { name: 'Nest', image: nestImage, category: 'Nature' },
  { name: 'Tree', image: treeImage, category: 'Nature' },
  { name: 'Rock', image: rockImage, category: 'Nature' },
  { name: 'Log', image: logImage, category: 'Nature' },
  { name: 'Car', image: carImage, category: 'Vehicles' },
  { name: 'Bus', image: busImage, category: 'Vehicles' },
  { name: 'Van', image: vanImage, category: 'Vehicles' },
  { name: 'Jet', image: jetImage, category: 'Vehicles' },
  { name: 'Boat', image: boatImage, category: 'Vehicles' },
  { name: 'Bike', image: bikeImage, category: 'Vehicles' },
  { name: 'Train', image: trainImage, category: 'Vehicles' },

  { name: 'Mom', image: momImage, category: 'People' },
  { name: 'Dad', image: dadImage, category: 'People' },
  { name: 'Kid', image: kidImage, category: 'People' },
  { name: 'Man', image: manImage, category: 'People' },
];