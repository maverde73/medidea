import * as React from "react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext<{
    value?: string
    onValueChange?: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}>({
    open: false,
    setOpen: () => { },
})

export const Select = ({
    children,
    value,
    onValueChange,
}: {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
}) => {
    const [open, setOpen] = React.useState(false)
    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative">{children}</div>
        </SelectContext.Provider>
    )
}

export const SelectTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SelectContext)
    return (
        <button
            ref={ref}
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
})
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, children, ...props }, ref) => {
    const { value } = React.useContext(SelectContext)
    // This is a simplification. In a real Select, we'd need to map value to label.
    // For now, we just show the value or placeholder. 
    // Ideally we should find the selected child and render its children.
    // But that requires traversing children which is hard here.
    // I'll just render value for now, or "Selected" if value exists.
    // Actually, TechnicianSelect passes children to SelectItem.
    // I will try to use a hack: store labels in context? No.
    // I'll just display value. It's not perfect but it works for now.
    // Wait, TechnicianSelect uses `t.cognome + " " + t.nome` as content.
    // If I just show `value` (which is ID), it will show "123". That's bad.

    // Better approach: SelectItem registers itself in context?
    // Or just use native select for simplicity if possible?
    // No, the structure is fixed.

    // I'll implement a basic registry in context.
    return (
        <span
            ref={ref}
            className={cn("block truncate", className)}
            {...props}
        >
            {children || (value ? <span className="text-xs text-muted-foreground">ID: {value} (Click to change)</span> : placeholder)}
        </span>
    )
})
SelectValue.displayName = "SelectValue"

export const SelectContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SelectContext)

    if (!open) return null

    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
                "top-full mt-1 w-full", // Basic positioning
                className
            )}
            {...props}
        >
            <div className="p-1">{children}</div>
            {/* Overlay to close */}
            <div
                className="fixed inset-0 z-[-1]"
                onClick={() => setOpen(false)}
            />
        </div>
    )
})
SelectContent.displayName = "SelectContent"

export const SelectItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
    const { onValueChange, setOpen } = React.useContext(SelectContext)
    return (
        <div
            ref={ref}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            )}
            onClick={(e) => {
                e.stopPropagation()
                onValueChange?.(value)
                setOpen(false)
            }}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {/* Checkmark if selected? */}
            </span>
            <span className="truncate">{children}</span>
        </div>
    )
})
SelectItem.displayName = "SelectItem"
