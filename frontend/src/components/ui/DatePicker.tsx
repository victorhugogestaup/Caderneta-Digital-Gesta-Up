import { useState, useRef, useEffect } from 'react'
import { todayBR } from '../../utils/formatDate'

interface DatePickerProps {
  label?: string
  value?: string
  onChange: (value: string) => void
  error?: string
  fullWidth?: boolean
}

export default function DatePicker({
  label = 'DATA',
  value,
  onChange,
  error,
  fullWidth = true,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || todayBR())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (value) setInputValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 8) val = val.slice(0, 8)
    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2)
    if (val.length >= 5) val = val.slice(0, 5) + '/' + val.slice(5)
    setInputValue(val)
    if (val.length === 10) onChange(val)
  }

  const handleToday = () => {
    const today = todayBR()
    setInputValue(today)
    onChange(today)
    setIsOpen(false)
  }

  const baseStyles = 'min-h-[60px] text-xl px-4 py-3 bg-white border-2 rounded-xl focus:outline-none transition-colors'
  const stateStyles = error
    ? 'border-red-500 focus:border-red-700'
    : 'border-gray-400 focus:border-black'
  const widthStyles = fullWidth ? 'w-full' : ''

  return (
    <div ref={containerRef} className={`${widthStyles} relative`}>
      <label className="block text-lg font-bold text-gray-900 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="DD/MM/AAAA"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className={`${baseStyles} ${stateStyles} flex-1`}
        />
        <button
          type="button"
          onClick={handleToday}
          className="min-h-[60px] px-4 bg-yellow-400 text-black font-bold rounded-xl active:scale-95 transition-transform whitespace-nowrap"
        >
          HOJE
        </button>
      </div>
      {error && (
        <p className="mt-2 text-base font-semibold text-red-700 flex items-center gap-2">
          <span>⚠️</span> {error}
        </p>
      )}
      {isOpen && (
        <div className="absolute z-10 mt-2 p-4 bg-white border-2 border-black rounded-xl shadow-2xl w-full">
          <p className="text-center text-lg text-gray-600 mb-3">
            Data selecionada: <strong className="text-black">{inputValue}</strong>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleToday}
              className="flex-1 min-h-[60px] bg-black text-white font-bold rounded-xl active:scale-95 transition-transform"
            >
              📅 USAR HOJE
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 min-h-[60px] bg-gray-200 text-black font-bold rounded-xl active:scale-95 transition-transform"
            >
              FECHAR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
