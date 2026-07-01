// src/components/common/Searchabledropdown.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

export interface DropdownOption {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
}

export interface SearchableDropdownProps {
  options: DropdownOption[];
  value?: string | null;
  onChange: (option: DropdownOption) => void;
  placeholder?: string;
  triggerPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  showEmptyState?: boolean;
  emptyStateText?: string;
  maxListHeight?: number;
  resetSearchOnOpen?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Search",
  triggerPlaceholder = "Select an option",
  disabled = false,
  className = "",
  showEmptyState = true,
  emptyStateText = "No results found",
  maxListHeight = 280,
  resetSearchOnOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) || null,
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.group ?? "").toLowerCase().includes(q)
    );
  }, [options, search]);

  const groupedOptions = useMemo(() => {
    const groups = new Map<string, DropdownOption[]>();
    const ungroupedKey = "";
    filteredOptions.forEach((opt) => {
      const key = opt.group ?? ungroupedKey;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(opt);
    });
    return Array.from(groups.entries());
  }, [filteredOptions]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    if (resetSearchOnOpen) setSearch("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [disabled, resetSearchOnOpen]);

  const toggleDropdown = useCallback(() => {
    if (isOpen) closeDropdown();
    else openDropdown();
  }, [isOpen, openDropdown, closeDropdown]);

  const handleSelect = useCallback(
    (option: DropdownOption) => {
      if (option.disabled) return;
      onChange(option);
      closeDropdown();
    },
    [onChange, closeDropdown]
  );

  // Calculate dropdown position
  const calculatePosition = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      
      // Calculate available space
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = Math.min(maxListHeight + 70, 350);
      
      let top = rect.bottom + window.scrollY + 6;
      
      // If not enough space below, show above
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        top = rect.top + window.scrollY - dropdownHeight - 6;
      }
      
      setDropdownPosition({
        top: top,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [maxListHeight]);

  // Update position when dropdown opens
  useEffect(() => {
    if (isOpen) {
      // Initial calculation
      calculatePosition();
      
      // Recalculate on scroll
      const handleScroll = () => {
        calculatePosition();
      };
      
      // Recalculate on resize
      const handleResize = () => {
        calculatePosition();
      };
      
      // Recalculate on any scroll event (including inside containers)
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen, calculatePosition]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  // Keep the highlighted item scrolled into view
  useEffect(() => {
    if (highlightedIndex < 0) return;
    const opt = filteredOptions[highlightedIndex];
    if (!opt) return;
    const el = optionRefs.current.get(opt.value);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, filteredOptions]);

  // Reset highlight whenever the filtered list changes
  useEffect(() => {
    setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1);
  }, [filteredOptions]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDropdown();
      }
    };
    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [isOpen, closeDropdown]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      default:
        break;
    }
  };

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] rounded-lg border border-gray-200 bg-white shadow-lg shadow-gray-900/10"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        maxHeight: Math.min(maxListHeight + 70, 350),
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search box */}
      <div className="sticky top-0 z-10 m-2 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 ring-1 ring-amber-500/20 focus-within:ring-2 focus-within:ring-amber-500/30">
        <svg
          className="h-4 w-4 flex-shrink-0 text-amber-400"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle
            cx="7"
            cy="7"
            r="5.25"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M11 11L14 14"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border-none bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>

      {/* List */}
      <div
        className="overflow-y-auto px-1 pb-2 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]"
        style={{ maxHeight: maxListHeight }}
      >
        {groupedOptions.length === 0 && showEmptyState && (
          <div className="px-3 py-4 text-center text-sm text-gray-400">
            {emptyStateText}
          </div>
        )}

        {groupedOptions.map(([group, opts]) => (
          <div className="[&+&]:mt-1" key={group || "ungrouped"}>
            {group && (
              <div className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {group}
              </div>
            )}
            {opts.map((opt) => {
              const flatIndex = filteredOptions.indexOf(opt);
              const isSelected = opt.value === value;
              const isHighlighted = flatIndex === highlightedIndex;
              return (
                <div
                  key={opt.value}
                  ref={(el) => {
                    if (el) optionRefs.current.set(opt.value, el);
                    else optionRefs.current.delete(opt.value);
                  }}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(flatIndex)}
                  onClick={() => handleSelect(opt)}
                  className={[
                    "mx-0.5 my-0.5 select-none rounded-lg px-3 py-2 text-sm transition-all duration-150",
                    opt.disabled
                      ? "cursor-not-allowed text-gray-300"
                      : "cursor-pointer",
                    isSelected
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 font-medium text-white shadow-sm"
                      : isHighlighted
                      ? "bg-amber-50 text-amber-700"
                      : "text-gray-700 hover:bg-amber-50 hover:text-amber-600",
                  ].join(" ")}
                >
                  {opt.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full font-sans ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={[
          "flex w-full items-center justify-between rounded-lg border px-3.5 py-2 text-sm transition-all duration-200",
          disabled
            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
            : "cursor-pointer bg-white text-gray-800 hover:border-amber-400 hover:shadow-sm",
          isOpen
            ? "border-amber-500 ring-2 ring-amber-500/30 shadow-sm"
            : "border-gray-300",
        ].join(" ")}
      >
        <span
          className={`truncate ${
            !selectedOption ? "text-gray-400" : "text-gray-800"
          }`}
        >
          {selectedOption ? selectedOption.label : triggerPlaceholder}
        </span>
        <svg
          className={`ml-2 h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M3 5L7 9L11 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default SearchableDropdown;