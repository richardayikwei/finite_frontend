import { useState } from "react"
import axios from "axios"
import { useDarkMode } from "../hooks/useDarkMode"
import { useEffect } from "react"
import ReCAPTCHA from "react-google-recaptcha"

export default function Home() {
  const [length, setLength] = useState("")
  const [warning, setWarning] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const { dark, setDark } = useDarkMode()
  const [token, setToken] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)

  const API = import.meta.env.VITE_API_BASE_URL
  const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  useEffect(() => {
  const fetchCount = async () => {
    try {
      const res = await axios.get(`${API}`)
      setCount(res.data.count)
    } catch (err) {
      console.error("Failed to fetch password count")
    }
  }

  fetchCount()
}, [])

  const validateLength = (value: string) => {
    if (value.includes(".")) {
      setWarning("Password length must be an integer")
    } else {
      setWarning("")
    }
    setLength(value)
  }

  const handleGenerate = async () => {
    if (!length || warning) return

    if (!token) {
        alert("Please complete the CAPTCHA")
        return
    }

    setLoading(true)
    setMessage("If you are one of us solve this.")   

    const response = await axios.post(`${API}/generate/`, {
      length: parseInt(length),
      captcha_token: token
    })

    const countRes = await axios.get(`${API}`)
    setCount(countRes.data.count)

    if (response.data.status === "robot") {
      setMessage("Welcome kin. Robots do not need passwords.")
      setTimeout(() => setLoading(false), 2000)
    } else {
      setMessage("Imposter. You are not one of us.")
      setPassword(response.data.password)
      setTimeout(() => setLoading(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-black dark:text-white relative">

      <button
        onClick={() => setDark(!dark)}
        className={`
            absolute top-5 right-5
            px-4 py-2 rounded-lg font-medium
            transition-all duration-200
            shadow-md
            bg-gray-200 text-gray-800
            dark:bg-gray-700 dark:text-white
            hover:bg-gray-300 dark:hover:bg-gray-600
            active:scale-95 active:shadow-inner
        `}
        >
            {dark ? "🌙 Dark" : "☀️ Light"}
      </button>

      {count !== null && (
     <div className="absolute top-5 left-1/2 -translate-x-1/2 text-sm opacity-70">
        Passwords generated: <span className="font-semibold">{count}</span>
     </div>
        )}
    

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
            className={`
                px-6 py-2 rounded-lg font-semibold transition-all duration-200
                bg-blue-600 text-white
                hover:bg-blue-700
                active:scale-95 active:bg-blue-800
                disabled:opacity-50 disabled:cursor-not-allowed
            `}
        >
            {loading ? "Scanning..." : "Generate"}
        </button>

        {loading && (
            <ReCAPTCHA
                sitekey={SITE_KEY}
                onChange={(value) => setToken(value)}
            />
        )}

        {password && <p className="mt-4">{password}</p>}
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col text-white">
          <div className="animate-pulse text-4xl">👀</div>
          <p className="mt-4">{message}</p>
        </div>
      )}
    </div>
  )
}