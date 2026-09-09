import React, { useState, useRef, useEffect } from 'react';
import { renderParagraphNumbers } from '../../constants/declarations';

export default function InlineParagraphSelector({
    label,
    options,
    selectedParas,
    onToggle,
    ariaLabel
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayText = selectedParas.length > 0
        ? renderParagraphNumbers(selectedParas)
        : 'none';

    return (
        <span className="inline-para-selector" ref={containerRef}>
            <button
                type="button"
                className={`inline-para-selector__button ${selectedParas.length > 0 ? 'has-selection' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={ariaLabel}
                aria-expanded={isOpen}
            >
                {displayText}
                <span className="inline-para-selector__icon">▼</span>
            </button>
            {isOpen && (
                <div className="inline-para-selector__popover">
                    <div className="inline-para-selector__header">
                        <strong>{label}</strong>
                        <span className="inline-para-selector__hint">Select paragraphs</span>
                    </div>
                    <div className="inline-para-selector__options">
                        {options.map(({ number, heading }) => (
                            <label key={number} className="inline-para-selector__option">
                                <input
                                    type="checkbox"
                                    checked={selectedParas.includes(number)}
                                    onChange={() => onToggle(number)}
                                />
                                <span className="inline-para-selector__option-text">
                                    <span className="inline-para-selector__option-num">{number}.</span> {heading}
                                </span>
                            </label>
                        ))}
                        {options.length === 0 && (
                            <div className="inline-para-selector__empty">No paragraphs available.</div>
                        )}
                    </div>
                </div>
            )}
        </span>
    );
}
