import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { useDarkMode } from "../hooks/useDarkMode"
import ReCAPTCHA from "react-google-recaptcha"
import eyesVideo from "../assets/eyes.mp4"

const API = import.meta.env.VITE_API_BASE_URL
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

export default function Home() {
  const [length, setLength] = useState("")
  const [warning, setWarning] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [count, setCount] = useState<number | null>(null)
  const [showCaptcha, setShowCaptcha] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { dark, setDark } = useDarkMode()

  // Fetch counter
  const fetchCount = async () => {
    try {
      const res = await axios.get(`${API}/count`)
      setCount(res.data.passwords_generated)
    } catch {
      console.error("Failed to fetch password count")
    }
  }

  useEffect(() => {
    fetchCount()
  }, [])

  // Start video AFTER overlay fades in
  useEffect(() => {
    if (showCaptcha || loading) {
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0
          videoRef.current.play()
        }
      }, 200) // delay for overlay fade

      return () => clearTimeout(timer)
    }
  }, [showCaptcha, loading])

  // Validate input
  const validateLength = (value: string) => {
    if (value.includes(".")) {
      setWarning("Password length must be an integer")
    } else {
      setWarning("")
    }
    setLength(value)
  }

  // Generate clicked
  const handleGenerate = () => {
    if (loading || showCaptcha) return
    if (!length || warning || Number(length) <= 0) return

    setPassword("")
    setShowCaptcha(true)
    setMessage("If you are one of us solve this.")
  }

  // CAPTCHA solved → call backend
  const handleCaptchaChange = async (value: string | null) => {
    if (!value) return

    setLoading(true)

    try {
      const response = await axios.post(`${API}/generate`, {
        length: Number(length),
        captcha_token: value,
      })

      await fetchCount()

      if (response.data.status === "robot") {
        setMessage("Welcome kin. Robots do not need passwords.")
        setPassword("")
      } else {
        setMessage("Imposter. You are not one of us.")
        setPassword(response.data.password)
      }
    } catch {
      setMessage("Signal lost. Try again.")
      setPassword("")
    }

    setTimeout(() => {
      setLoading(false)
      setShowCaptcha(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-black dark:text-white relative">

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDark(!dark)}
        className="absolute top-5 right-5 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 active:shadow-inner"
      >
        {dark ? "🌙 Dark" : "☀️ Light"}
      </button>

      {/* Counter */}
      {count !== null && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-sm opacity-70">
          Passwords generated: <span className="font-semibold">{count}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center gap-4">
        <input
          type="number"
          value={length}
          onChange={(e) => validateLength(e.target.value)}
          className="p-2 border rounded text-center"
          placeholder="Enter password length"
        />

        {warning && <p className="text-red-500">{warning}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 active:scale-95 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Scanning..." : "Generate"}
        </button>

        {password && (
          <p className="mt-4 font-mono bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded">
            {password}
          </p>
        )}
      </div>

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center flex-col text-white z-50 transition-opacity duration-500 ${
          showCaptcha || loading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <video
          ref={videoRef}
          src={eyesVideo}
          muted
          playsInline
          className="w-48 md:w-64 lg:w-80 mb-6 drop-shadow-2xl"
        />

        <p className="mb-6 text-center text-lg md:text-xl font-medium tracking-wide">
          {message}
        </p>

        {showCaptcha && !loading && (
          <ReCAPTCHA
            sitekey={SITE_KEY}
            onChange={handleCaptchaChange}
          />
        )}
      </div>
    </div>
  )
}