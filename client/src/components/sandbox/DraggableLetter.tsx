import { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLetterColors } from '../../lib/colorUtils';
import { learningModules } from '../../data/phonicsDecks';

interface DraggableLetterProps {
    id: string;
    letter: string;
    initialX: number;
    initialY: number;
    onDragStart: (id: string) => void;
    onDragMove: (id: string, x: number, y: number) => void;
    onDragEnd: (id: string, x: number, y: number) => void;
    onTap: (id: string) => void;
    containerRef: React.RefObject<HTMLDivElement>;
}

// Get the sound file for a letter from phonicsDecks
const getLetterSound = (letter: string): string | null => {
    const module = learningModules.find(m => m.type === 'letters');
    const letterData = module?.letters?.find(l => l.letter.toUpperCase() === letter.toUpperCase());
    return letterData?.sound || null;
};

export default function DraggableLetter({
    id,
    letter,
    initialX,
    initialY,
    onDragStart,
    onDragMove,
    onDragEnd,
    onTap,
    containerRef,
}: DraggableLetterProps) {
    const colors = getLetterColors(letter);
    const isDragging = useRef(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: initialX, y: initialY });
    const elementRef = useRef<HTMLDivElement>(null);
    const hasMoved = useRef(false);
    const [hasSpawned, setHasSpawned] = useState(false);

    // Play sound on spawn
    useEffect(() => {
        const soundFile = getLetterSound(letter);
        if (soundFile) {
            const audio = new Audio(soundFile);
            audio.play().catch(() => { });
        }
        // Trigger spawn animation
        const timer = setTimeout(() => setHasSpawned(true), 50);
        return () => clearTimeout(timer);
    }, [letter]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();

        isDragging.current = true;
        hasMoved.current = false;
        const el = elementRef.current;
        if (!el) return;

        // Capture pointer for reliable tracking
        el.setPointerCapture(e.pointerId);

        const rect = el.getBoundingClientRect();
        dragStartPos.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2,
        };

        // Get current position from transform
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
            currentPos.current = {
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top + rect.height / 2,
            };
        }

        onDragStart(id);
    }, [id, onDragStart, containerRef]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging.current) return;
        e.stopPropagation();
        e.preventDefault();

        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        const newX = e.clientX - containerRect.left;
        const newY = e.clientY - containerRect.top;

        currentPos.current = { x: newX, y: newY };
        hasMoved.current = true;

        // Direct DOM manipulation for performance (no React re-render)
        if (elementRef.current) {
            elementRef.current.style.left = `${newX}px`;
            elementRef.current.style.top = `${newY}px`;
        }

        onDragMove(id, newX, newY);
    }, [id, onDragMove, containerRef]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!isDragging.current) return;
        e.stopPropagation();

        isDragging.current = false;

        const el = elementRef.current;
        if (el) {
            el.releasePointerCapture(e.pointerId);
        }

        if (!hasMoved.current) {
            // It was a tap, not a drag
            onTap(id);
            // Play sound on tap
            const soundFile = getLetterSound(letter);
            if (soundFile) {
                const audio = new Audio(soundFile);
                audio.play().catch(() => { });
            }
            if (navigator.vibrate) navigator.vibrate(5);
        } else {
            onDragEnd(id, currentPos.current.x, currentPos.current.y);
        }
    }, [id, letter, onTap, onDragEnd]);

    const fontSize = 'clamp(3rem, 12vmin, 6rem)';

    return (
        <motion.div
            ref={elementRef}
            className="absolute select-none touch-none cursor-grab active:cursor-grabbing z-10"
            style={{
                left: initialX,
                top: initialY,
                transform: 'translate(-50%, -50%)',
                touchAction: 'none',
            }}
            initial={{ scale: 0, rotate: -20, opacity: 0 }}
            animate={{
                scale: hasSpawned ? 1 : 0,
                rotate: 0,
                opacity: 1
            }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 18,
                mass: 0.8,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <div className={`relative flex items-center justify-center rounded-3xl shadow-xl border-b-4 border-black/10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2`}
                style={{ minWidth: '80px', minHeight: '80px' }}
            >
                {/* Color accent bar on top */}
                <div className={`absolute top-0 left-3 right-3 h-1.5 rounded-b-full ${colors.background}`} />

                <span
                    className={`font-black ${colors.text} drop-shadow-sm select-none`}
                    style={{ fontSize, fontFamily: "'Nunito', sans-serif", lineHeight: 1 }}
                >
                    {letter.toUpperCase()}
                </span>
            </div>
        </motion.div>
    );
}
