import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [colors, setColors] = useState([])
  const [pickedColor, setPickedColor] = useState('')
  const [message, setMessage] = useState('')
  const [isHardMode, setIsHardMode] = useState(true)
  const [gameWon, setGameWon] = useState(false)

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    return `rgb(${r}, ${g}, ${b})`
  }

  const generateColors = (num) => {
    const arr = []
    for (let i = 0; i < num; i++) {
      arr.push(generateRandomColor())
    }
    return arr
  }

  const reset = () => {
    const numSquares = isHardMode ? 6 : 3
    const newColors = generateColors(numSquares)
    setColors(newColors)
    setPickedColor(newColors[Math.floor(Math.random() * newColors.length)])
    setMessage('')
    setGameWon(false)
  }

  useEffect(() => {
    reset()
  }, [isHardMode])

  const handleSquareClick = (color) => {
    if (gameWon) return

    if (color === pickedColor) {
      setMessage('Correct!')
      setGameWon(true)
      setColors(new Array(colors.length).fill(pickedColor))
    } else {
      setMessage('Try Again')
      setColors(colors.map(c => c === color ? '#232323' : c))
    }
  }

  return (
    <div className="game-container">
      <header>
        <h1>The Great
          <br />
          <span className="color-display">{pickedColor}</span>
          <br />
          Color Game</h1>
      </header>

      <nav>
        <button onClick={reset}>New Colors</button>
        <span className="message">{message}</span>
        <div className="mode-buttons">
          <button
            className={!isHardMode ? 'selected' : ''}
            onClick={() => setIsHardMode(false)}
          >
            Easy
          </button>
          <button
            className={isHardMode ? 'selected' : ''}
            onClick={() => setIsHardMode(true)}
          >
            Hard
          </button>
        </div>
      </nav>

      <div className="squares-container">
        {colors.map((color, i) => (
          <div
            key={i}
            className="square"
            style={{ backgroundColor: color }}
            onClick={() => handleSquareClick(color)}
          />
        ))}
      </div>
    </div>
  )
}

export default App