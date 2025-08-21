"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simple fallback popover implementation without Radix UI dependency
// Note: Install @radix-ui/react-popover for full functionality

interface PopoverProps {
  children: React.ReactNode;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const PopoverContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {}
});

const Popover: React.FC<PopoverProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger: React.FC<PopoverTriggerProps> = ({
  children,
  onClick,
  className
}) => {
  const { setIsOpen } = React.useContext(PopoverContext);

  const handleClick = () => {
    setIsOpen(true);
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn("inline-flex items-center", className)}
    >
      {children}
    </button>
  );
};

const PopoverContent: React.FC<PopoverContentProps> = ({
  children,
  className,
  align = "center",
  sideOffset = 4
}) => {
  const { isOpen, setIsOpen } = React.useContext(PopoverContext);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 w-72 rounded-md border bg-white p-4 shadow-md outline-none",
        "top-full mt-1", // Simple positioning - always below trigger
        align === "start" && "left-0",
        align === "center" && "left-1/2 transform -translate-x-1/2",
        align === "end" && "right-0",
        className
      )}
      style={{ marginTop: sideOffset }}
    >
      {children}
    </div>
  );
};

export { Popover, PopoverTrigger, PopoverContent }
