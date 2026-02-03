"use client";

import { useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { Input, InputProps, Spinner } from "@heroui/react";
import { cn } from "@/utils/helpers";

interface SearchInputProps extends InputProps {
  isLoading?: boolean;
}

const SearchInput = ({
  value,
  onChange,
  className,
  autoFocus,
  placeholder = "Đang tìm phim cho bạn...",
  isLoading,
  isDisabled,
}: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Input
      ref={inputRef}
      isDisabled={isDisabled}
      autoComplete="off"
      spellCheck="false"
      autoFocus={autoFocus}
      className={cn(className, "w-full")}
      placeholder={placeholder}
      value={value}
      radius="full"
      onChange={onChange}
      classNames={{
        inputWrapper: "bg-secondary-background",
        input: "text-sm",
      }}
      aria-label="Tìm kiếm"
      type="Tìm kiếm"
      labelPlacement="outside"
      startContent={
        isLoading && (
          <div className="pointer-events-none flex shrink-0 items-center pr-1 text-default-400">
            <Spinner color="default" size="sm" />
          </div>
        )
      }
      endContent={
        <div className="pointer-events-none flex shrink-0 items-center pl-1 text-default-400">
          <FaSearch />
        </div>
      }
    />
  );
};

export default SearchInput;
