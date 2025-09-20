import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

const Card = ({ card }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
        <img src={card.image} alt={card.title} className="w-full h-48 object-cover pointer-events-none" />
        <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
        </div>
    </div>
);

const GAP_PX = 16;
const VISIBLE_CARDS_DESKTOP = 3;
const VISIBLE_CARDS_TABLET = 2;
const VISIBLE_CARDS_MOBILE = 1;
const DRAG_BUFFER = 50;
const VELOCITY_THRESHOLD = 500;


export const Carousel = ({ cards }) => {
    const [index, setIndex] = useState(0);
    const [cardWidth, setCardWidth] = useState(0);
    const [visibleCards, setVisibleCards] = useState(VISIBLE_CARDS_DESKTOP);
    const [displayCards, setDisplayCards] = useState([]);
    const [isJumping, setIsJumping] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const carouselRef = useRef(null);

    const canNavigate = cards.length > visibleCards;

    const handleResize = useCallback(() => {
        let currentVisibleCards;
        if (window.innerWidth >= 1024) {
            currentVisibleCards = VISIBLE_CARDS_DESKTOP;
        } else if (window.innerWidth >= 768) {
            currentVisibleCards = VISIBLE_CARDS_TABLET;
        } else {
            currentVisibleCards = VISIBLE_CARDS_MOBILE;
        }
        setVisibleCards(currentVisibleCards);

        if (carouselRef.current) {
            const containerWidth = carouselRef.current.offsetWidth;
            const newCardWidth = (containerWidth - (GAP_PX * (currentVisibleCards - 1))) / currentVisibleCards;
            setCardWidth(newCardWidth);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial calculation
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    useEffect(() => {
        if (cards.length > 0 && visibleCards > 0) {
            const clonesCount = visibleCards;
            const startClones = cards.slice(cards.length - clonesCount);
            const endClones = cards.slice(0, clonesCount);
            setDisplayCards([...startClones, ...cards, ...endClones]);
            setIndex(clonesCount);
        }
    }, [cards, visibleCards]);
    
    useEffect(() => {
        if (isJumping) {
            const timer = setTimeout(() => setIsJumping(false), 50);
            return () => clearTimeout(timer);
        }
    }, [isJumping]);

    const handleNext = () => {
        if (isAnimating || !canNavigate) return;
        setIsAnimating(true);
        setIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (isAnimating || !canNavigate) return;
        setIsAnimating(true);
        setIndex(prev => prev - 1);
    };
    
    const handleDotClick = (targetDotIndex) => {
        if (isAnimating || !canNavigate) return;
        setIsAnimating(true);
        setIndex(targetDotIndex + visibleCards);
    }
    
    const handleAnimationComplete = () => {
        setIsAnimating(false);
        const clonesCount = visibleCards;

        if (index >= cards.length + clonesCount) {
            setIsJumping(true);
            setIndex(clonesCount);
        }

        if (index < clonesCount) {
            setIsJumping(true);
            setIndex(index + cards.length);
        }
    };
    
    const onDragEnd = (event, { offset, velocity }) => {
        if (isAnimating || !canNavigate) return;

        if (offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD) {
            handleNext();
        } else if (offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD) {
            handlePrev();
        }
    };


    const xOffset = -index * (cardWidth + GAP_PX);
    
    // Calculate the active dot index based on the real card position
    const activeDotIndex = canNavigate ? (index - visibleCards + cards.length) % cards.length : 0;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Carousel cards title</h2>
                {canNavigate && (
                    <div className="flex space-x-2">
                        <button
                            onClick={handlePrev}
                            disabled={isAnimating}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
                            aria-label="Previous card"
                        >
                            <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={isAnimating}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
                            aria-label="Next card"
                        >
                            <ChevronRightIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}
            </div>

            <div ref={carouselRef} className="overflow-hidden">
                <motion.div
                    className="flex cursor-grab active:cursor-grabbing"
                    style={{ gap: `${GAP_PX}px` }}
                    animate={{ x: xOffset }}
                    transition={isJumping ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 50 }}
                    onAnimationComplete={handleAnimationComplete}
                    drag="x"
                    dragElastic={0.2}
                    onDragEnd={onDragEnd}
                >
                    {displayCards.map((card, i) => (
                        <div
                            key={`${card.id}-${i}`}
                            className="flex-none"
                            style={{ width: cardWidth > 0 ? `${cardWidth}px` : '100%' }}
                        >
                            <Card card={card} />
                        </div>
                    ))}
                </motion.div>
            </div>
            
            {canNavigate && (
                <div className="flex justify-center space-x-2 mt-6">
                    {cards.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handleDotClick(i)}
                            disabled={isAnimating}
                            className={`h-3 w-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                activeDotIndex === i ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};