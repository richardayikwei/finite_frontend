import { useState } from "react"
import axios from "axios"
import { useDarkMode } from "../hooks/useDarkMode"
import ReCAPTCHA from "react-google-recaptcha"

export default function Home() {
  const [length, setLength] = useState("")
  const [warning, setWarning] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const { dark, setDark } = useDarkMode()
  const [token, setToken] = useState<string | null>(null)

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

    // TODO: Integrate captcha token here
    

    const response = await axios.post("http://localhost:8000/generate-password", {
      length: parseInt(length),
      captcha_token: "TOKEN"
    })

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
        className="absolute top-5 right-5"
      >
        Toggle Mode
      </button>

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
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Generate
        </button>

        {loading && (
            <ReCAPTCHA
                sitekey="YOUR_SITE_KEY"
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