import { Search } from 'lucide-react'

export function SearchBar() {
    return (
        <div className="relative w-full max-w-xs">
            <input
                type="text"
                placeholder="Search"
                className="w-full h-10 pl-4 pr-10 rounded-full border border-gray-400 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            <button
                type="button"
                className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center rounded-full bg-[var(--color-search-btn)] hover:bg-[var(--color-search-btn-hover)] transition-colors"
            >
                <Search className="h-4 w-4 text-white" />
            </button>
        </div>
    )
}
