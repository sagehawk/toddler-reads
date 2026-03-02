import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { usePreventBackExit } from '@/hooks/usePreventBackExit';
import { getLetterColors } from '../lib/colorUtils';
import { learningModules } from '../data/phonicsDecks';
import { sandboxWords } from '../data/sandboxWords';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import confetti from 'canvas-confetti';

// ----- Constants -----
const BLOCK_SIZE = 88;
const BLOCK_GAP = 4; // Gap between snapped blocks
const SNAP_DISTANCE = BLOCK_SIZE * 2; // How close to trigger magnetic snap
const SPRING_CONFIG = { stiffness: 300, damping: 22, mass: 0.8 };
const MIN_SPAWN_DISTANCE = BLOCK_SIZE + 20; // Minimum distance between block home positions

// Get the sound file for a letter
const getLetterSound = (letter: string): string | null => {
    const mod = learningModules.find(m => m.type === 'letters');
    const data = mod?.letters?.find(l => l.letter.toUpperCase() === letter.toUpperCase());
    return data?.sound || null;
};

// ----- Types -----
interface LetterBlock {
    id: string;
    letter: string;
    wordIndex: number; // position in the target word (0, 1, 2...)
    homeX: number;
    homeY: number;
    connectedTo: string | null; // id of block snapped to the right
    connectedFrom: string | null; // id of block snapped from the left
    springTrigger: number; // incremented to force spring-back even when home doesn't change
}

let blockIdCounter = 0;

// ===== FloatingBlock Component =====
function FloatingBlock({
    block,
    allBlocks,
    onDragStartChain,
    onDragMoveChain,
    onDragEndChain,
    onTap,
    containerRef,
    isWordComplete,
    dragOffset,
}: {
    block: LetterBlock;
    allBlocks: LetterBlock[];
    onDragStartChain: (id: string) => void;
    onDragMoveChain: (id: string, x: number, y: number) => void;
    onDragEndChain: (id: string, x: number, y: number) => void;
    onTap: (id: string) => void;
    containerRef: React.RefObject<HTMLDivElement>;
    isWordComplete: boolean;
    dragOffset: { dx: number; dy: number } | null; // non-null when this block is being chain-dragged
}) {
    const colors = getLetterColors(block.letter);
    const isDraggingThis = useRef(false);
    const hasMoved = useRef(false);
    const elementRef = useRef<HTMLDivElement>(null);

    // Motion values for smooth animation
    const x = useMotionValue(block.homeX);
    const y = useMotionValue(block.homeY);
    const springX = useSpring(x, SPRING_CONFIG);
    const springY = useSpring(y, SPRING_CONFIG);

    // Update position: either from drag offset (chain drag) or home position
    useEffect(() => {
        if (dragOffset) {
            x.jump(block.homeX + dragOffset.dx);
            y.jump(block.homeY + dragOffset.dy);
        } else if (!isDraggingThis.current) {
            x.set(block.homeX);
            y.set(block.homeY);
        }
    }, [block.homeX, block.homeY, block.springTrigger, dragOffset, x, y]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();

        isDraggingThis.current = true;
        hasMoved.current = false;

        const el = elementRef.current;
        if (!el) return;
        el.setPointerCapture(e.pointerId);

        onDragStartChain(block.id);
    }, [block.id, onDragStartChain]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDraggingThis.current) return;
        e.stopPropagation();
        e.preventDefault();

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const px = e.clientX - rect.left - BLOCK_SIZE / 2;
        const py = e.clientY - rect.top - BLOCK_SIZE / 2;

        hasMoved.current = true;

        // During drag, directly set this block's position
        x.jump(px);
        y.jump(py);

        // Tell parent to move all chain siblings
        onDragMoveChain(block.id, px, py);
    }, [containerRef, x, y, block.id, onDragMoveChain]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!isDraggingThis.current) return;
        e.stopPropagation();

        isDraggingThis.current = false;
        const el = elementRef.current;
        if (el) el.releasePointerCapture(e.pointerId);

        if (!hasMoved.current) {
            onTap(block.id);
        } else {
            const currentX = x.get();
            const currentY = y.get();
            onDragEndChain(block.id, currentX, currentY);
        }
    }, [block.id, x, y, onTap, onDragEndChain]);

    const isConnected = block.connectedTo !== null || block.connectedFrom !== null;

    return (
        <motion.div
            ref={elementRef}
            className="absolute select-none touch-none cursor-grab active:cursor-grabbing"
            style={{
                left: springX,
                top: springY,
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                zIndex: (isDraggingThis.current || dragOffset) ? 50 : 10,
                touchAction: 'none',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {/* Wooden block */}
            <div className={`w-full h-full rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-300 ${isWordComplete
                ? 'shadow-[0_0_30px_rgba(34,197,94,0.6)] ring-3 ring-green-400'
                : isConnected
                    ? 'shadow-[0_0_15px_rgba(59,130,246,0.4)] ring-2 ring-blue-300'
                    : 'shadow-lg hover:shadow-xl'
                }`}
                style={{
                    background: 'linear-gradient(145deg, #f5e6c8 0%, #e8d5a8 30%, #d4bc82 70%, #c4a862 100%)',
                    border: '2.5px solid #b8963a',
                }}
            >
                {/* Wood grain */}
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: `repeating-linear-gradient(
              85deg, transparent, transparent 10px,
              rgba(120, 80, 30, 0.3) 10px, rgba(120, 80, 30, 0.3) 11px
            )`,
                    }}
                />

                {/* Inner bevel */}
                <div className="absolute inset-[3px] rounded-lg border border-amber-200/40" />

                {/* Letter */}
                <span
                    className={`relative z-10 font-black select-none ${colors.text}`}
                    style={{
                        fontSize: `${BLOCK_SIZE * 0.52}px`,
                        fontFamily: "'Nunito', sans-serif",
                        lineHeight: 1,
                        textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
                        filter: 'saturate(1.4)',
                    }}
                >
                    {block.letter.toUpperCase()}
                </span>

                {/* Magnetic glow indicators on edges when connected */}
                {block.connectedFrom && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-400/60 rounded-r" />
                )}
                {block.connectedTo && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-blue-400/60 rounded-l" />
                )}
            </div>
        </motion.div>
    );
}

// ===== ToyBox for this version =====
function DispenseToyBox({
    lettersRemaining,
    onDispense,
}: {
    lettersRemaining: number;
    onDispense: () => void;
}) {
    const [isBumped, setIsBumped] = useState(false);

    const handleTap = useCallback((e: React.PointerEvent | React.MouseEvent) => {
        e.stopPropagation();
        if (lettersRemaining <= 0) return;
        if (navigator.vibrate) navigator.vibrate(15);
        setIsBumped(true);
        onDispense();
        setTimeout(() => setIsBumped(false), 400);
    }, [onDispense, lettersRemaining]);

    if (lettersRemaining <= 0) return null;

    return (
        <motion.button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleTap}
            className="relative flex items-center justify-center select-none focus:outline-none"
            animate={isBumped ? {
                y: [0, -18, 0],
                scale: [1, 1.15, 1],
            } : {}}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Release next letter"
        >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 border-4 border-amber-600 shadow-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-2xl" />
                <span className="text-4xl sm:text-5xl font-black text-amber-800 drop-shadow-sm select-none" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    ?
                </span>
                {/* Count badge */}
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-xs font-bold">{lettersRemaining}</span>
                </div>
                {/* Rivet dots */}
                <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-amber-700/40" />
                <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-700/40" />
                <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-amber-700/40" />
                <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-700/40" />
            </div>

            {/* Sparkles */}
            <AnimatePresence>
                {isBumped && (
                    <>
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-yellow-300"
                                initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                                animate={{
                                    opacity: 0, scale: 1.5,
                                    x: Math.cos((i * Math.PI * 2) / 5) * 35,
                                    y: Math.sin((i * Math.PI * 2) / 5) * 35 - 15,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

// ===== Main SandboxPage =====
export default function SandboxPage() {
    usePreventBackExit();
    const [, navigate] = useLocation();
    const containerRef = useRef<HTMLDivElement>(null);

    // State
    const [blocks, setBlocks] = useState<LetterBlock[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [spawnedCount, setSpawnedCount] = useState(0);
    const [isWordComplete, setIsWordComplete] = useState(false);

    // TTS
    const { speak, voices } = useSpeechSynthesis();
    const voice = useMemo(() =>
        voices?.find(v => v.lang.startsWith('en') && v.name.includes('Female')) ||
        voices?.find(v => v.lang.startsWith('en')) || null
        , [voices]);

    // Shuffle words
    const shuffledWords = useMemo(() => {
        const arr = [...sandboxWords];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, []);

    const currentWord = shuffledWords[currentWordIndex % shuffledWords.length];
    const wordLetters = currentWord.word.split('');
    const lettersRemaining = wordLetters.length - spawnedCount;

    // Calculate scattered home positions for blocks, avoiding overlap
    const getHomePosition = useCallback((index: number, total: number, existingBlocks: LetterBlock[]) => {
        const container = containerRef.current;
        if (!container) return { x: 200, y: 200 };
        const w = container.clientWidth;
        const h = container.clientHeight;

        // Scatter blocks in columns with randomized vertical positions
        const spreadX = Math.min(w * 0.6, total * (BLOCK_SIZE + 60));
        const startX = (w - spreadX) / 2;
        const stepX = total > 1 ? spreadX / (total - 1) : 0;

        // Randomize Y across a wide vertical band (25%–65% of screen)
        const minY = h * 0.25;
        const maxY = h * 0.65;
        const randY = minY + Math.random() * (maxY - minY);

        // Add horizontal jitter within the column (±30px)
        const xJitter = (Math.random() - 0.5) * 60;

        let candidateX = startX + index * stepX + xJitter;
        let candidateY = randY;

        // Push away from existing blocks to avoid overlap
        for (let attempt = 0; attempt < 10; attempt++) {
            let hasOverlap = false;
            for (const existing of existingBlocks) {
                const dx = candidateX - existing.homeX;
                const dy = candidateY - existing.homeY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MIN_SPAWN_DISTANCE) {
                    hasOverlap = true;
                    // Push in a random direction
                    const pushAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
                    candidateX = existing.homeX + Math.cos(pushAngle) * MIN_SPAWN_DISTANCE;
                    candidateY = existing.homeY + Math.sin(pushAngle) * MIN_SPAWN_DISTANCE;
                    // Clamp to screen bounds
                    candidateX = Math.max(BLOCK_SIZE, Math.min(w - BLOCK_SIZE * 2, candidateX));
                    candidateY = Math.max(BLOCK_SIZE + 60, Math.min(h - BLOCK_SIZE * 2, candidateY));
                    break;
                }
            }
            if (!hasOverlap) break;
        }

        return {
            x: candidateX,
            y: candidateY,
        };
    }, []);

    // Track drag state for chain dragging — using ref to avoid stale closures
    const dragStateRef = useRef<{
        leaderId: string;
        startX: number;
        startY: number;
        currentDx: number;
        currentDy: number;
        chainIds: Set<string>;
    } | null>(null);
    const [, forceRender] = useState(0); // Trigger re-render when drag state changes

    // Dispense one letter
    const handleDispense = useCallback(() => {
        if (spawnedCount >= wordLetters.length) return;

        const letter = wordLetters[spawnedCount];

        setBlocks(prev => {
            const pos = getHomePosition(spawnedCount, wordLetters.length, prev);
            const newBlock: LetterBlock = {
                id: `block-${blockIdCounter++}`,
                letter,
                wordIndex: spawnedCount,
                homeX: pos.x,
                homeY: pos.y,
                connectedTo: null,
                connectedFrom: null,
                springTrigger: 0,
            };

            // Play letter sound
            const soundFile = getLetterSound(letter);
            if (soundFile) {
                const audio = new Audio(soundFile);
                audio.play().catch(() => { });
            }

            return [...prev, newBlock];
        });
        setSpawnedCount(prev => prev + 1);
    }, [spawnedCount, wordLetters, getHomePosition]);

    // Handle tap — play sound
    const handleTap = useCallback((id: string) => {
        const block = blocks.find(b => b.id === id);
        if (!block) return;

        if (navigator.vibrate) navigator.vibrate(8);

        // Find all connected blocks in this chain
        const chain = getConnectedChain(id, blocks);
        if (chain.length > 1) {
            // Play the whole connected group as a blended sound
            const word = chain.map(b => b.letter).join('');
            speak(word, { voice, rate: 0.8 });
        } else {
            // Single letter
            const soundFile = getLetterSound(block.letter);
            if (soundFile) {
                const audio = new Audio(soundFile);
                audio.play().catch(() => { });
            }
            speak(block.letter, { voice, rate: 0.9 });
        }
    }, [blocks, speak, voice]);

    // Drag start — record chain info (connections are PERMANENT, never broken)
    const handleDragStartChain = useCallback((id: string) => {
        const block = blocks.find(b => b.id === id);
        if (!block) return;

        // Get all blocks in this connected chain
        const chain = getConnectedChain(id, blocks);
        const chainIds = new Set(chain.map(b => b.id));

        dragStateRef.current = {
            leaderId: id,
            startX: block.homeX,
            startY: block.homeY,
            currentDx: 0,
            currentDy: 0,
            chainIds,
        };
        forceRender(n => n + 1);
    }, [blocks]);

    // Drag move — update offset for entire chain
    const handleDragMoveChain = useCallback((id: string, currentX: number, currentY: number) => {
        const ds = dragStateRef.current;
        if (!ds || ds.leaderId !== id) return;
        ds.currentDx = currentX - ds.startX;
        ds.currentDy = currentY - ds.startY;
        forceRender(n => n + 1);
    }, []);

    // Handle drag end — check magnetic snap for each block in the chain against non-chain blocks
    const handleDragEndChain = useCallback((id: string, dropX: number, dropY: number) => {
        const ds = dragStateRef.current;
        dragStateRef.current = null;
        forceRender(n => n + 1);

        setBlocks(prev => {
            if (!ds) return prev;

            const { chainIds, currentDx, currentDy } = ds;

            // Calculate hypothetical post-drag positions (don't commit yet)
            const hypothetical = new Map<string, { hx: number; hy: number }>();
            for (const b of prev) {
                if (chainIds.has(b.id)) {
                    hypothetical.set(b.id, { hx: b.homeX + currentDx, hy: b.homeY + currentDy });
                } else {
                    hypothetical.set(b.id, { hx: b.homeX, hy: b.homeY });
                }
            }

            let snapped = false;
            let newBlocks = [...prev];

            for (const chainBlockId of Array.from(chainIds)) {
                const chainBlock = prev.find(b => b.id === chainBlockId);
                if (!chainBlock) continue;
                const hyp = hypothetical.get(chainBlockId);
                if (!hyp) continue;

                for (const other of prev) {
                    if (chainIds.has(other.id)) continue; // Skip blocks in same chain

                    const dx = hyp.hx - other.homeX;
                    const dy = hyp.hy - other.homeY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < SNAP_DISTANCE) {
                        const dragIdx = chainBlock.wordIndex;
                        const otherIdx = other.wordIndex;

                        // Snap dragged chain to the RIGHT of other
                        if (dragIdx === otherIdx + 1 && other.connectedTo === null && chainBlock.connectedFrom === null) {
                            // Calculate where the chain block should be
                            const snapX = other.homeX + BLOCK_SIZE + BLOCK_GAP;
                            const snapY = other.homeY; // Align vertically!
                            const offsetX = snapX - hyp.hx;
                            const offsetY = snapY - hyp.hy;

                            newBlocks = newBlocks.map(b => {
                                if (chainIds.has(b.id)) {
                                    const h = hypothetical.get(b.id)!;
                                    return { ...b, homeX: h.hx + offsetX, homeY: h.hy + offsetY, springTrigger: b.springTrigger + 1 };
                                }
                                return b;
                            });
                            // Set connections
                            newBlocks = newBlocks.map(b => {
                                if (b.id === chainBlockId) return { ...b, connectedFrom: other.id };
                                if (b.id === other.id) return { ...b, connectedTo: chainBlockId };
                                return b;
                            });
                            snapped = true;

                            // Play blended sound
                            const chain = getConnectedChainFromBlocks(other.id, newBlocks);
                            if (chain.length > 1) {
                                const blendedWord = chain.map(b => b.letter).join('');
                                setTimeout(() => {
                                    speak(blendedWord, { voice, rate: 0.75 });
                                    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
                                }, 150);
                            }
                            break;
                        }

                        // Snap dragged chain to the LEFT of other
                        if (dragIdx === otherIdx - 1 && other.connectedFrom === null && chainBlock.connectedTo === null) {
                            const snapX = other.homeX - BLOCK_SIZE - BLOCK_GAP;
                            const snapY = other.homeY; // Align vertically!
                            const offsetX = snapX - hyp.hx;
                            const offsetY = snapY - hyp.hy;

                            newBlocks = newBlocks.map(b => {
                                if (chainIds.has(b.id)) {
                                    const h = hypothetical.get(b.id)!;
                                    return { ...b, homeX: h.hx + offsetX, homeY: h.hy + offsetY, springTrigger: b.springTrigger + 1 };
                                }
                                return b;
                            });
                            newBlocks = newBlocks.map(b => {
                                if (b.id === chainBlockId) return { ...b, connectedTo: other.id };
                                if (b.id === other.id) return { ...b, connectedFrom: chainBlockId };
                                return b;
                            });
                            snapped = true;

                            const chain = getConnectedChainFromBlocks(chainBlockId, newBlocks);
                            if (chain.length > 1) {
                                const blendedWord = chain.map(b => b.letter).join('');
                                setTimeout(() => {
                                    speak(blendedWord, { voice, rate: 0.75 });
                                    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
                                }, 150);
                            }
                            break;
                        }
                    }
                }
                if (snapped) break;
            }

            if (!snapped) {
                // No snap — bump springTrigger to force all chain blocks to spring back to their ORIGINAL home
                newBlocks = newBlocks.map(b => {
                    if (chainIds.has(b.id)) {
                        return { ...b, springTrigger: b.springTrigger + 1 };
                    }
                    return b;
                });
            }

            // Check if the full word is formed
            const fullChain = findFullWordChain(newBlocks, wordLetters.length);
            if (fullChain) {
                const formedWord = fullChain.map(b => b.letter).join('');
                if (formedWord.toUpperCase() === currentWord.word.toUpperCase()) {
                    setTimeout(() => {
                        setIsWordComplete(true);
                        speak(currentWord.word, { voice, rate: 0.85 });
                        if (navigator.vibrate) navigator.vibrate([30, 80, 30, 80, 50]);
                        confetti({
                            particleCount: 60,
                            spread: 70,
                            origin: { y: 0.5 },
                        });

                        // Center the completed word on screen
                        const container = containerRef.current;
                        if (container) {
                            const w = container.clientWidth;
                            const h = container.clientHeight;
                            const totalWidth = fullChain.length * BLOCK_SIZE + (fullChain.length - 1) * BLOCK_GAP;
                            const startX = (w - totalWidth) / 2;
                            const centerY = h / 2 - BLOCK_SIZE / 2;

                            setBlocks(prev => prev.map(b => {
                                const chainIdx = fullChain.findIndex(c => c.id === b.id);
                                if (chainIdx >= 0) {
                                    return {
                                        ...b,
                                        homeX: startX + chainIdx * (BLOCK_SIZE + BLOCK_GAP),
                                        homeY: centerY,
                                        springTrigger: b.springTrigger + 1,
                                    };
                                }
                                return b;
                            }));
                        }
                    }, 300);
                }
            }

            return newBlocks;
        });
    }, [wordLetters, currentWord, speak, voice]);

    // Advance to next word
    const handleNextWord = useCallback(() => {
        setBlocks([]);
        setSpawnedCount(0);
        setIsWordComplete(false);
        setCurrentWordIndex(prev => prev + 1);
    }, []);

    // Keyboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                navigate('/app', { replace: true });
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                if (isWordComplete) {
                    handleNextWord();
                } else if (lettersRemaining > 0) {
                    handleDispense();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, handleDispense, handleNextWord, isWordComplete, lettersRemaining]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 select-none overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800"
            style={{ touchAction: 'none' }}
        >
            {/* Soft floating particles background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded-full bg-amber-200/30 dark:bg-amber-500/10"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            x: [0, 10, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 4 + i * 0.7,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.5,
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <header className="absolute top-0 left-0 w-full p-4 z-50 flex items-center justify-between pointer-events-none">
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate('/app', { replace: true });
                    }}
                    className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-white/60 hover:bg-white/90 dark:bg-gray-700/50 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-300 transition-colors focus:outline-none shadow-sm backdrop-blur-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                {/* Word hint — blanks that fill in as letters are dispensed */}
                <div className="flex items-center gap-1.5">
                    {wordLetters.map((letter, i) => {
                        const isSpawned = i < spawnedCount;
                        return (
                            <div
                                key={i}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-300 ${isSpawned
                                    ? 'bg-amber-100 border-2 border-amber-300 text-amber-600'
                                    : 'bg-gray-200/50 border-2 border-dashed border-gray-300/50 text-transparent'
                                    }`}
                                style={{ fontFamily: "'Nunito', sans-serif" }}
                            >
                                {isSpawned ? letter : '?'}
                            </div>
                        );
                    })}
                </div>

                <div className="w-14" />
            </header>

            {/* Floating blocks */}
            <AnimatePresence>
                {blocks.map(block => {
                    // Calculate drag offset for chain siblings
                    const ds = dragStateRef.current;
                    let offset: { dx: number; dy: number } | null = null;
                    if (ds && ds.chainIds.has(block.id) && ds.leaderId !== block.id) {
                        offset = { dx: ds.currentDx, dy: ds.currentDy };
                    }
                    return (
                        <FloatingBlock
                            key={block.id}
                            block={block}
                            allBlocks={blocks}
                            onDragStartChain={handleDragStartChain}
                            onDragMoveChain={handleDragMoveChain}
                            onDragEndChain={handleDragEndChain}
                            onTap={handleTap}
                            containerRef={containerRef as React.RefObject<HTMLDivElement>}
                            isWordComplete={isWordComplete}
                            dragOffset={offset}
                        />
                    );
                })}
            </AnimatePresence>

            {/* Toy Box — vertically centered, right side */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40">
                <DispenseToyBox
                    lettersRemaining={lettersRemaining}
                    onDispense={handleDispense}
                />
            </div>

            {/* Next Word button — appears after word is complete */}
            <AnimatePresence>
                {isWordComplete && (
                    <motion.div
                        className="absolute bottom-6 right-6 z-40"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 1 }}
                    >
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNextWord();
                            }}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-green-400 to-green-600 border-4 border-green-700 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                        >
                            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Word complete celebration */}
            <AnimatePresence>
                {isWordComplete && (
                    <motion.div
                        className="absolute top-24 left-0 right-0 flex justify-center z-30 pointer-events-none"
                        initial={{ scale: 0, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-10 py-4 rounded-2xl shadow-2xl">
                            <span className="text-4xl font-black tracking-wider" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                {currentWord.word}! ⭐
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty state */}
            {blocks.length === 0 && !isWordComplete && (
                <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <motion.p
                        className="text-2xl sm:text-3xl font-bold text-gray-300 dark:text-gray-600 text-center"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        Tap <span className="text-amber-400">?</span> for a letter!
                    </motion.p>
                </motion.div>
            )}
        </div>
    );
}

// ----- Helpers -----

// Get the full connected chain starting from any block in the chain
function getConnectedChain(startId: string, blocks: LetterBlock[]): LetterBlock[] {
    return getConnectedChainFromBlocks(startId, blocks);
}

function getConnectedChainFromBlocks(startId: string, blocks: LetterBlock[]): LetterBlock[] {
    const blockMap = new Map(blocks.map(b => [b.id, b]));

    // Walk left to find the head
    let head = blockMap.get(startId);
    if (!head) return [];
    while (head.connectedFrom) {
        const prev = blockMap.get(head.connectedFrom);
        if (!prev) break;
        head = prev;
    }

    // Walk right to build chain
    const chain: LetterBlock[] = [head];
    let current = head;
    while (current.connectedTo) {
        const next = blockMap.get(current.connectedTo);
        if (!next) break;
        chain.push(next);
        current = next;
    }

    return chain;
}

// Find a chain that contains all blocks (full word)
function findFullWordChain(blocks: LetterBlock[], wordLength: number): LetterBlock[] | null {
    if (blocks.length !== wordLength) return null;

    // Find head (no connectedFrom)
    const head = blocks.find(b => b.connectedFrom === null && b.connectedTo !== null);
    if (!head) {
        // Check if there's only one block and wordLength is 1
        if (wordLength === 1 && blocks.length === 1) return blocks;
        return null;
    }

    const chain = getConnectedChainFromBlocks(head.id, blocks);
    if (chain.length === wordLength) return chain;
    return null;
}
