import { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLetterColors } from '../../lib/colorUtils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface DraggableNumberProps {
    id: string;
    number: number;
    initialX: number;
    initialY: number;
    onDragStart: (id: string) => void;
    onDragMove: (id: string, x: number, y: number) => void;
    onDragEnd: (id: string, x: number, y: number) => void;
    onTap: (id: string) => void;
    containerRef: React.RefObject<HTMLDivElement>;
}

export default function DraggableNumber({
    id,
    number,
    initialX,
    initialY,
    onDragStart,
    onDragMove,
    onDragEnd,
    onTap,
    containerRef,
}: DraggableNumberProps) {
    const colors = getLetterColors(String(number));
    const isDragging = useRef(false);
    const currentPos = useRef({ x: initialX, y: initialY });
    const elementRef = useRef<HTMLDivElement>(null);
    const hasMoved = useRef(false);
    const [hasSpawned, setHasSpawned] = useState(false);
    const { speak, voices } = useSpeechSynthesis();

    const voice = voices?.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices?.find(v => v.lang.startsWith('en')) || null;

    // Speak number on spawn
    useEffect(() => {
        speak(String(number), { voice, rate: 1.0 });
        const timer = setTimeout(() => setHasSpawned(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();

        isDragging.current = true;
        hasMoved.current = false;
        const el = elementRef.current;
        if (!el) return;

        el.setPointerCapture(e.pointerId);

        const rect = el.getBoundingClientRect();
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
            onTap(id);
            speak(String(number), { voice, rate: 1.0 });
            if (navigator.vibrate) navigator.vibrate(5);
        } else {
            onDragEnd(id, currentPos.current.x, currentPos.current.y);
        }
    }, [id, number, voice, speak, onTap, onDragEnd]);

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
            initial={{ scale: 0, y: -30, opacity: 0 }}
            animate={{
                scale: hasSpawned ? 1 : 0,
                y: 0,
                opacity: 1
            }}
            transition={{
                type: 'spring',
                stiffness: 350,
                damping: 20,
                mass: 1.2, // Numbers feel "heavier"
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <div className="relative flex items-center justify-center rounded-3xl shadow-xl border-b-[6px] border-black/15 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-5 py-3"
                style={{ minWidth: '90px', minHeight: '90px' }}
            >
                {/* Weight indicator — double accent bar */}
                <div className={`absolute top-0 left-3 right-3 h-2 rounded-b-full ${colors.background}`} />
                <div className={`absolute bottom-0 left-3 right-3 h-1 rounded-t-full ${colors.background} opacity-50`} />

                <span
                    className={`font-black ${colors.text} drop-shadow-sm select-none`}
                    style={{ fontSize, fontFamily: "'Nunito', sans-serif", lineHeight: 1 }}
                >
                    {number}
                </span>
            </div>
        </motion.div>
    );
}
