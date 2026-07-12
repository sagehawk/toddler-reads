import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRoute } from "wouter";
import confetti from "canvas-confetti";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useSwipe } from "@/hooks/useSwipe";
import { TrayMenu } from "@/components/TrayMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TapReadSentence } from "@/components/TapReadSentence";

// Import images
import appleImage from "../assets/animals/apple.png";
import ballImage from "../assets/animals/ball.png";
import hatImage from "../assets/animals/hat.png";
import keyImage from "../assets/animals/key.png";
import boxImage from "../assets/animals/box.png";
import cupImage from "../assets/animals/cup.png";
import bedImage from "../assets/animals/bed.png";
import toyImage from "../assets/animals/toy.png";
import penImage from "../assets/animals/pen.png";
import bagImage from "../assets/animals/bag.png";
import juiceImage from "../assets/animals/juice.png";
import pizzaImage from "../assets/animals/pizza.png";
import yogurtImage from "../assets/animals/yogurt.png";
import orangeImage from "../assets/animals/orange.png";
import watermelonImage from "../assets/animals/watermelon.png";
import sunImage from "../assets/animals/sun.png";
import moonImage from "../assets/animals/moon.png";
import nestImage from "../assets/animals/nest.png";
import treeImage from "../assets/animals/tree.png";
import rockImage from "../assets/animals/rock.png";
import logImage from "../assets/animals/log.png";
import carImage from "../assets/animals/car.png";
import busImage from "../assets/animals/bus.png";
import vanImage from "../assets/animals/van.png";
import jetImage from "../assets/animals/jet.png";
import boatImage from "../assets/animals/boat.png";
import bikeImage from "../assets/animals/bike.png";
import trainImage from "../assets/animals/train.png";

import momImage from "../assets/animals/mom.png";
import dadImage from "../assets/animals/dad.png";
import kidImage from "../assets/animals/kid.png";
import manImage from "../assets/animals/man.png";
import catImage from "../assets/animals/cat.png";
import dogImage from "../assets/animals/dog.png";
import fishImage from "../assets/animals/fish.png";
import goatImage from "../assets/animals/goat.png";
import lionImage from "../assets/animals/lion.png";
import rabbitImage from "../assets/animals/rabbit.png";
import turtleImage from "../assets/animals/turtle.png";
import zebraImage from "../assets/animals/zebra.png";
import pandaImage from "../assets/animals/panda.png";
import henImage from "../assets/animals/hen.png";
import cowImage from "../assets/animals/cow.png";
import duckImage from "../assets/animals/duck.png";
import ratImage from "../assets/animals/rat.png";
import batImage from "../assets/animals/bat.png";

// Import combined images
import momDadHugImage from "../assets/animals/mom_dad_hug.png";
import dogRunImage from "../assets/animals/dog_run.png";
import henLogImage from "../assets/animals/hen_log.png";
import ratBoxImage from "../assets/animals/rat_box.png";
import batRockImage from "../assets/animals/bat_rock.png";
import bigLionImage from "../assets/animals/big_lion.png";
import ballBagImage from "../assets/animals/bag_ball.png";
import cupBedImage from "../assets/animals/cup_bed.png";
import keyBedImage from "../assets/animals/key_bed.png";
import kidPenImage from "../assets/animals/kid_pen.png";
import manOrangeImage from "../assets/animals/man_orange.png";
import moonUpImage from "../assets/animals/moon_up.png";
import nestTreeImage from "../assets/animals/nest_tree.png";
import iSitOnRockImage from "../assets/animals/i_sit_on_rock.png";
import logBigImage from "../assets/animals/log_big.png";
import bigBusImage from "../assets/animals/big_bus.png";
import jetGoImage from "../assets/animals/the jet can go.png";
import kidBikeImage from "../assets/animals/kid_bike.png";
import eatAppleImage from "../assets/animals/eat_apple.png";
import seeCarImage from "../assets/animals/see_car.png";
import seeHatImage from "../assets/animals/see_hat.png";
import seePizzaImage from "../assets/animals/see_pizza.png";
import seeYogurtImage from "../assets/animals/see_yogurt.png";
import toyBoxImage from "../assets/animals/toy_box.png";
import trainGoImage from "../assets/animals/train_go.png";
import turtleNapImage from "../assets/animals/turtle_nap.png";
import vanSunImage from "../assets/animals/van_sun.png";
import weGoOnBoatImage from "../assets/animals/we_go_on_boat.png";
import weGoTreeImage from "../assets/animals/we_go_tree.png";
import weSeeSunImage from "../assets/animals/we_see_sun.png";
import weSitLogImage from "../assets/animals/we_sit_log.png";
import kidEatImage from "../assets/animals/the kid can eat.png";
import kidRunImage from "../assets/animals/the kid can run.png";
import kidSitImage from "../assets/animals/the kid can sit.png";
import kidBinImage from "../assets/animals/this kid is in the bin.png";
import kidSeeImage from "../assets/animals/see - The kid can see.png";
import shipImage from "../assets/animals/ship.png";

const wordImageMap: { [key: string]: string } = {
  apple: appleImage,
  ball: ballImage,
  hat: hatImage,
  key: keyImage,
  box: boxImage,
  cup: cupImage,
  bed: bedImage,
  toy: toyImage,
  pen: penImage,
  bag: bagImage,
  juice: juiceImage,
  pizza: pizzaImage,
  yogurt: yogurtImage,
  orange: orangeImage,
  watermelon: watermelonImage,
  sun: sunImage,
  moon: moonImage,
  nest: nestImage,
  tree: treeImage,
  rock: rockImage,
  log: logImage,
  car: carImage,
  bus: busImage,
  van: vanImage,
  jet: jetImage,
  boat: boatImage,
  bike: bikeImage,
  train: trainImage,
  ship: shipImage,

  mom: momImage,
  dad: dadImage,
  kid: kidImage,
  man: manImage,
  cat: catImage,
  dog: dogImage,
  fish: fishImage,
  goat: goatImage,
  lion: lionImage,
  rabbit: rabbitImage,
  turtle: turtleImage,
  zebra: zebraImage,
  panda: pandaImage,
  hen: henImage,
  cow: cowImage,
  duck: duckImage,
  rat: ratImage,
  bat: batImage,
};

const combinedImageMap: { [key: string]: string } = {
  "The dog can run.": dogRunImage,
  "I see the dog run.": dogRunImage,
  "The hen is on a log.": henLogImage,
  "The rat is in a box.": ratBoxImage,
  "A bat is on a rock.": batRockImage,
  "The lion is big.": bigLionImage,
  "The ball is in a bag.": ballBagImage,
  "The cup is on a bed.": cupBedImage,
  "The key is on a bed.": keyBedImage,
  "The key is on the bed.": keyBedImage,
  "The kid has a pen.": kidPenImage,
  "The man has an orange.": manOrangeImage,
  "The moon is up.": moonUpImage,
  "A nest is in a tree.": nestTreeImage,
  "I sit on a rock.": iSitOnRockImage,
  "A log is big.": logBigImage,
  "The bus is big.": bigBusImage,
  "The jet can go.": jetGoImage,
  "The kid is on a bike.": kidBikeImage,
  "I eat an apple.": eatAppleImage,
  "Mom and Dad hug.": momDadHugImage,
  "I see a car.": seeCarImage,
  "I see a hat.": seeHatImage,
  "We see a pizza.": seePizzaImage,
  "I see yogurt.": seeYogurtImage,
  "A toy is in the box.": toyBoxImage,
  "The train can go.": trainGoImage,
  "The turtle can nap.": turtleNapImage,
  "A van is in the sun.": vanSunImage,
  "We go on a boat.": weGoOnBoatImage,
  "We go to a tree.": weGoTreeImage,
  "We see the sun.": weSeeSunImage,
  "We sit on a log.": weSitLogImage,
  "The kid can eat.": kidEatImage,
  "The kid can run.": kidRunImage,
  "The kid can sit.": kidSitImage,
  "The kid is in a bin.": kidBinImage,
  "The kid can see.": kidSeeImage,
};

interface Sentence {
  text: string;
  category: string;
}

export const sentences: Sentence[] = [
  { text: "I see a cat.", category: "Animals" },
  { text: "The dog can run.", category: "Animals" },
  { text: "The hen is on a log.", category: "Animals" },
  { text: "We see a cow.", category: "Animals" },
  { text: "The rat is in a box.", category: "Animals" },
  { text: "A bat is on a rock.", category: "Animals" },
  { text: "The lion is big.", category: "Animals" },
  { text: "I see a fish.", category: "Animals" },
  { text: "The turtle can nap.", category: "Animals" },
  { text: "The ball is in a bag.", category: "Things" },
  { text: "I see a hat.", category: "Things" },
  { text: "The cup is on a bed.", category: "Things" },
  { text: "A toy is in the box.", category: "Things" },
  { text: "I eat an apple.", category: "Things" },
  { text: "We see a pizza.", category: "Things" },
  { text: "The key is on the bed.", category: "Things" },
  { text: "The kid has a pen.", category: "Things" },
  { text: "I see yogurt.", category: "Things" },
  { text: "The man has an orange.", category: "Things" },
  { text: "We see the sun.", category: "Nature" },
  { text: "The moon is up.", category: "Nature" },
  { text: "A nest is in a tree.", category: "Nature" },
  { text: "I sit on a rock.", category: "Nature" },
  { text: "A log is big.", category: "Nature" },
  { text: "I see a car.", category: "Vehicles" },
  { text: "The bus is big.", category: "Vehicles" },
  { text: "A van is in the sun.", category: "Vehicles" },
  { text: "I see a jet.", category: "Vehicles" },
  { text: "I see a ship.", category: "Vehicles" },
  { text: "We go on a boat.", category: "Vehicles" },
  { text: "The kid is on a bike.", category: "Vehicles" },
  { text: "The train can go.", category: "Vehicles" },
  { text: "Mom and Dad hug.", category: "People" },
  { text: "I see a man.", category: "People" },
  { text: "The kid can hop.", category: "People" },
  { text: "The kid is in a bin.", category: "People" },
  { text: "I run to a box.", category: "Actions" },
  { text: "We sit on a log.", category: "Actions" },
  { text: "The cat can hop.", category: "Actions" },
  { text: "The kid can nap.", category: "Actions" },
  { text: "The kid can eat.", category: "Actions" },
  { text: "The kid can run.", category: "Actions" },
  { text: "The kid can sit.", category: "Actions" },
  { text: "The kid can see.", category: "Actions" },
  { text: "We go to a tree.", category: "Actions" },
  { text: "I see the dog run.", category: "Actions" },
];

const categoryOrder = [
  "Animals",
  "Things",
  "Nature",
  "Vehicles",
  "People",
  "Actions",
];

const sortedSentences = [...sentences].sort((a, b) => {
  const categoryA = categoryOrder.indexOf(a.category);
  const categoryB = categoryOrder.indexOf(b.category);
  if (categoryA !== categoryB) {
    return categoryA - categoryB;
  }
  return 0;
});

import { usePreventBackExit } from "@/hooks/usePreventBackExit";

// After this many finger-point reads, a sentence starts appearing as an
// automatic "read along with me" fluent pass.
const SENTENCE_MASTERY_THRESHOLD = 2;
// Even mastered sentences still get an occasional finger-point round.
const FLUENT_MODE_CHANCE = 0.75;

const SentencesApp = () => {
  usePreventBackExit();
  const [, params] = useRoute("/sentences/:category?");
  const category = params?.category;

  const filteredSentences =
    category && category !== "all"
      ? sortedSentences.filter(
          (item) =>
            item.category.toLowerCase().replace(/[\s/]+/g, "-") === category,
        )
      : sortedSentences;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const [hasListened, setHasListened] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  // Per-sentence progress, persisted on the device: how many times each
  // sentence has been finger-point read. Drives fluent-mode graduation and
  // shuffle weighting, mirroring the Words page.
  const [sentenceMastery, setSentenceMastery] = useLocalStorage<Record<string, number>>(
    "sentenceMastery",
    {},
  );

  const { speak, stop, preferredVoice } = useSpeechSynthesis();

  // Ref to track image loading
  const imageLoadedRef = useRef(false);

  // Clamp the index: when the category changes, this renders once with the old
  // index before the reshuffle effect runs, which used to crash on short lists.
  const currentItem =
    filteredSentences.length > 0
      ? filteredSentences[currentIndex % filteredSentences.length]
      : undefined;

  let imageToDisplay = currentItem ? combinedImageMap[currentItem.text] : undefined;

  if (!imageToDisplay && currentItem) {
    const words = currentItem.text.toLowerCase().replace(".", "").split(" ");
    for (const word of words) {
      if (wordImageMap[word]) {
        imageToDisplay = wordImageMap[word];
        break;
      }
    }
  }

  // Decide how this card plays, once per card (stable across re-renders)
  const cardMode = useMemo<"read" | "fluent">(() => {
    const text = currentItem?.text;
    const mastery = text ? sentenceMastery[text] ?? 0 : 0;
    return mastery >= SENTENCE_MASTERY_THRESHOLD && Math.random() < FLUENT_MODE_CHANCE
      ? "fluent"
      : "read";
    // Intentionally keyed to the card only — mode must not flip mid-card
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const shuffleItems = useCallback(
    (shouldSetFirst = false) => {
      // Weighted bag: sentences not yet read fluently appear twice per cycle
      const bag: number[] = [];
      filteredSentences.forEach((item, i) => {
        bag.push(i);
        if ((sentenceMastery[item.text] ?? 0) < SENTENCE_MASTERY_THRESHOLD) {
          bag.push(i);
        }
      });
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      // Never show the same sentence twice in a row
      for (let i = 1; i < bag.length; i++) {
        if (bag[i] === bag[i - 1]) {
          const k = bag.findIndex((v, idx) => idx > i && v !== bag[i]);
          if (k !== -1) [bag[i], bag[k]] = [bag[k], bag[i]];
        }
      }
      setShuffledIndices(bag);
      if (shouldSetFirst && bag.length > 0) {
        setCurrentIndex(bag[0]);
        setShuffledIndex(1);
      } else {
        setShuffledIndex(0);
      }
    },
    [filteredSentences, sentenceMastery],
  );

  useEffect(() => {
    shuffleItems(true);
    // Reshuffle only when the category changes — not when mastery updates mid-cycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Reset listened state and image loaded ref
  useEffect(() => {
    setHasListened(false);
    setIsImageVisible(false);
    imageLoadedRef.current = false;
  }, [currentIndex]);

  // Reveal the picture once the sentence has been read, and keep it up so the
  // child can connect the words to the scene (matches the vocab page).
  useEffect(() => {
    if (hasListened) {
      setIsImageVisible(true);
    }
  }, [hasListened]);

  const handleShuffle = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    stop();
    setIsShuffling(true);

    setTimeout(() => {
      let nextIndex = shuffledIndex;
      if (nextIndex >= shuffledIndices.length) {
        shuffleItems(true);
      } else {
        setHasListened(false); // Reset immediately
        setIsImageVisible(false);
        setCurrentIndex(shuffledIndices[nextIndex]);
        setShuffledIndex((prev) => prev + 1);
      }
      setIsShuffling(false);
    }, 150);
  }, [shuffledIndex, shuffledIndices, shuffleItems, stop]);

  const handleInteraction = useCallback(() => {
    // Little palms brush the background while finger-point reading —
    // background taps only advance once the sentence has been read out.
    // Swipes and arrow keys still work as the grown-up escape hatch.
    if (!hasListened) return;
    handleShuffle();
  }, [handleShuffle, hasListened]);

  const handleSequenceComplete = useCallback(() => {
    setHasListened(true);
    // Reading a whole sentence is a big win
    confetti({
      particleCount: 60,
      spread: 75,
      origin: { y: 0.7 },
      colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#FF9F1C", "#a78bfa"],
    });
    // Only finger-point reads build mastery; fluent passes maintain it
    if (cardMode === "read" && currentItem) {
      setSentenceMastery((prev) => ({
        ...prev,
        [currentItem.text]: (prev[currentItem.text] ?? 0) + 1,
      }));
    }
  }, [cardMode, currentItem, setSentenceMastery]);

  const handleNext = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    stop();
    setTimeout(() => {
      setHasListened(false); // Reset immediately
      setIsImageVisible(false);
      setCurrentIndex(
        (prevIndex) => (prevIndex + 1) % filteredSentences.length,
      );
    }, 150);
  }, [filteredSentences.length, stop]);

  const handlePrevious = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    stop();
    setTimeout(() => {
      setHasListened(false); // Reset immediately
      setIsImageVisible(false);
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex - 1 + filteredSentences.length) % filteredSentences.length,
      );
    }, 150);
  }, [filteredSentences.length, stop]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "a" && e.key <= "z") {
        const newIndex = filteredSentences.findIndex((item) =>
          item.text.toLowerCase().startsWith(e.key),
        );
        if (newIndex !== -1) {
          setHasListened(false); // Reset immediately
          setIsImageVisible(false);
          setCurrentIndex(newIndex);
        }
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        handleShuffle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePrevious, handleNext, filteredSentences, handleShuffle]);

  if (!currentItem) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="fixed inset-0 select-none flex flex-col overflow-hidden touchable-area bg-[#FFFDF9] dark:bg-[#000000]"
      onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
      onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
      onTouchEnd={(e) => swipeHandlers.onTouchEnd()}
      onClick={handleInteraction}
    >
      <header className="absolute top-0 left-0 w-full p-4 z-50 flex items-center justify-between pointer-events-none">
        <TrayMenu currentPageId="sentences" />
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center overflow-hidden w-full relative">
        <main className="flex flex-col items-center justify-center text-center px-4 w-full h-full">
          <div
            className="w-full flex justify-center items-center"
            style={{ perspective: "1000px" }}
          >
            <div
              className="card"
              style={{
                width: "100%",
                maxWidth: "800px",
                height: "clamp(200px, 55vh, 500px)",
              }}
            >
              <div className="card-face card-face-front px-8 relative overflow-hidden">
                 {/* Background Image Layer */}
                 {imageToDisplay && (
                  <div 
                    key={currentIndex}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out flex items-center justify-center ${isImageVisible ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <img
                      src={imageToDisplay}
                      alt={currentItem.text}
                      className="w-full h-full object-contain scale-115 opacity-25"
                      draggable="false"
                      onLoad={() => {
                        imageLoadedRef.current = true;
                      }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}

                {/* Text Layer — taps on the card never advance it; the words
                    themselves are the interactive reading targets */}
                <div
                  className="relative z-10 w-full h-full flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!isShuffling && (
                    <TapReadSentence
                      key={currentIndex}
                      text={currentItem.text}
                      voice={preferredVoice ?? null}
                      mode={cardMode}
                      onComplete={handleSequenceComplete}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SentencesApp;
