"use client"

import * as React from "react"
import { X, ChevronDown, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Option = {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export function MultiSelect({ options, selected, onChange, placeholder = "Select options..." }: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const handleToggle = () => setIsOpen(!isOpen)

  const handleSelect = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const handleUnselect = (option: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((item) => item !== option))
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
        onClick={handleToggle}
      >
        <div className="flex flex-wrap gap-1">
          {selected.length > 0 ? (
            selected.map((item) => (
              <Badge key={item} variant="secondary" className="mr-1">
                {options.find((option) => option.value === item)?.label}
                <span className="ml-1 cursor-pointer" onClick={(e) => handleUnselect(item, e)}>
                  <X className="h-3 w-3" />
                </span>
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center px-2 py-1 cursor-pointer hover:bg-accent"
              onClick={() => handleSelect(option.value)}
            >
              <div className={`mr-2 h-4 w-4 ${selected.includes(option.value) ? "text-primary" : "text-transparent"}`}>
                <Check className="h-4 w-4" />
              </div>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

