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

const DROPDOWN_MAX_HEIGHT = 320; // px, cap for the whole panel

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
  maxListHeight = 240,
  resetSearchOnOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rafRef = useRef<number>(0);

  // ─── Derived data ──────────────────────────────────────────────────────────

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) ?? null,
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
    filteredOptions.forEach((opt) => {
      const key = opt.group ?? "";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(opt);
    });
    return Array.from(groups.entries());
  }, [filteredOptions]);

  // ─── Position (fixed, viewport-relative — works inside ANY scroll container) ──

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const panelH = Math.min(DROPDOWN_MAX_HEIGHT, maxListHeight + 56 /* search box */);
    const spaceBelow = window.innerHeight - r.bottom - 6;
    const spaceAbove = r.top - 6;

    const openBelow = spaceBelow >= panelH || spaceBelow >= spaceAbove;
    const top = openBelow ? r.bottom + 4 : r.top - panelH - 4;

    setStyle({
      position: "fixed",
      top,
      left: r.left,
      width: r.width,
      maxHeight: panelH,
      zIndex: 99999,
    });
  }, [maxListHeight]);

  // ─── Open / close helpers ──────────────────────────────────────────────────

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    updatePosition();
    setIsOpen(true);
    if (resetSearchOnOpen) setSearch("");
    // Focus search after render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => inputRef.current?.focus());
    });
  }, [disabled, resetSearchOnOpen, updatePosition]);

  const toggleDropdown = useCallback(() => {
    isOpen ? closeDropdown() : openDropdown();
  }, [isOpen, openDropdown, closeDropdown]);

  const handleSelect = useCallback(
    (option: DropdownOption) => {
      if (option.disabled) return;
      onChange(option);
      closeDropdown();
    },
    [onChange, closeDropdown]
  );

  // ─── Keep position in sync while open (scroll / resize anywhere) ──────────

  useEffect(() => {
    if (!isOpen) return;

    const onScroll = (e: Event) => {
      // If the scroll happened inside the dropdown panel itself, just reposition.
      // If it happened anywhere else (page, sidebar, any container) → close.
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(updatePosition);
      } else {
        closeDropdown();
      }
    };

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen, updatePosition, closeDropdown]);

  // ─── Click-outside to close ────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        !triggerRef.current?.contains(t) &&
        !dropdownRef.current?.contains(t)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, closeDropdown]);

  // ─── Keyboard: Escape ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeDropdown]);

  // ─── Scroll highlighted option into view ──────────────────────────────────

  useEffect(() => {
    if (highlightedIndex < 0) return;
    const opt = filteredOptions[highlightedIndex];
    if (!opt) return;
    optionRefs.current.get(opt.value)?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, filteredOptions]);

  // ─── Reset highlight when filtered list changes ───────────────────────────

  useEffect(() => {
    setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1);
  }, [filteredOptions]);

  // ─── Keyboard navigation on the trigger wrapper ───────────────────────────

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
        setHighlightedIndex((p) =>
          p < filteredOptions.length - 1 ? p + 1 : p
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((p) => (p > 0 ? p - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
    }
  };

  // ─── Portal content ───────────────────────────────────────────────────────

  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      style={style}
      className="rounded-lg border border-gray-200 bg-white shadow-xl shadow-gray-900/10 flex flex-col overflow-hidden"
    >
      {/* Search box */}
      <div className="flex-shrink-0 m-2 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 ring-1 ring-amber-500/20 focus-within:ring-2 focus-within:ring-amber-500/30">
        <svg className="h-4 w-4 flex-shrink-0 text-amber-400" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.4" />
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

      {/* Option list */}
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
          <div key={group || "ungrouped"} className="[&+&]:mt-1">
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
                  onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                  onClick={() => handleSelect(opt)}
                  className={[
                    "mx-0.5 my-0.5 select-none rounded-lg px-3 py-2 text-sm transition-all duration-100",
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
  ) : null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={triggerRef}
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
        <span className={`truncate ${!selectedOption ? "text-gray-400" : "text-gray-800"}`}>
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

      {typeof document !== "undefined" &&
        createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default SearchableDropdown;
