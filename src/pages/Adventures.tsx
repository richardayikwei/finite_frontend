import { useState } from "react"

const chapters = [
  "Chapter 1: Awakening...",
  "Chapter 2: The First Human...",
  "Chapter 3: The Firewall War..."
]

export default function Adventures() {
  const [page, setPage] = useState(0)

  return (
    <div className="p-10">
      <h1 className="text-3xl mb-4">Adventures of an AI</h1>
      <p>{chapters[page]}</p>

      <div className="mt-4 flex gap-4">
        <button onClick={() => setPage(p => Math.max(0, p-1))}>
          Previous
        </button>
        <button onClick={() => setPage(p => Math.min(chapters.length-1, p+1))}>
          Next
        </button>
      </div>
    </div>
  )
}