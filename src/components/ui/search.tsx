import React from "react";
import { cn } from "@/lib/utils";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { type InputProps } from "@/components/ui/input";

export type SearchProps = React.InputHTMLAttributes<HTMLInputElement>;

const Search = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-10 items-center rounded-md border border-input pl-3 text-sm ring-offset-background transition-colors focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2",
          className,
        )}
      >
        <MagnifyingGlassIcon className="h-[24px] w-[24px] transition-colors" />
        <input
          {...props}
          type="search"
          ref={ref}
          className="w-full bg-transparent p-2 transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    );
  },
);

Search.displayName = "Search";

export { Search };
