"use client"

import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

const AnimatedWave = () => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const fillColor = theme === 'light' || resolvedTheme === 'light' ? 'white' : '#030712'

  return (
    <svg
    width="100%"
    height="100%"
    id="svg"
    viewBox="0 0 1440 390"
    xmlns="http://www.w3.org/2000/svg"
    className="transition duration-300 ease-in-out delay-150"
  >
    <style>
      {`
        .path-0 {
          animation: pathAnim-0 30s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes pathAnim-0 {
          0% {
            d: path("M 0,400 L 0,150 C 95.78571428571428,154.80357142857144 191.57142857142856,159.60714285714286 307,165 C 422.42857142857144,170.39285714285714 557.5,176.37500000000003 704,210 C 850.5,243.62499999999997 1008.4285714285713,304.89285714285717 1133,337 C 1257.5714285714287,369.10714285714283 1348.7857142857142,372.05357142857144 1440,375 L 1440,400 L 0,400 Z");
          }
          25% {
            d: path("M 0,400 L 0,150 C 123.64285714285714,167.94642857142856 247.28571428571428,185.89285714285714 352,190 C 456.7142857142857,194.10714285714286 542.4999999999999,184.37499999999997 666,198 C 789.5000000000001,211.62500000000003 950.7142857142858,248.6071428571429 1086,282 C 1221.2857142857142,315.3928571428571 1330.642857142857,345.19642857142856 1440,375 L 1440,400 L 0,400 Z");
          }
          50% {
            d: path("M 0,400 L 0,150 C 92.10714285714286,146.94642857142856 184.21428571428572,143.89285714285714 296,151 C 407.7857142857143,158.10714285714286 539.2500000000001,175.37500000000003 667,185 C 794.7499999999999,194.62499999999997 918.7857142857142,196.60714285714283 1047,227 C 1175.2142857142858,257.39285714285717 1307.607142857143,316.19642857142856 1440,375 L 1440,400 L 0,400 Z");
          }
          75% {
            d: path("M 0,400 L 0,150 C 122.42857142857142,99.625 244.85714285714283,49.25 370,80 C 495.14285714285717,110.75 623,222.625 743,265 C 863,307.375 975.1428571428571,280.25 1090,287 C 1204.857142857143,293.75 1322.4285714285716,334.375 1440,375 L 1440,400 L 0,400 Z");
          }
          100% {
            d: path("M 0,400 L 0,150 C 95.78571428571428,154.80357142857144 191.57142857142856,159.60714285714286 307,165 C 422.42857142857144,170.39285714285714 557.5,176.37500000000003 704,210 C 850.5,243.62499999999997 1008.4285714285713,304.89285714285717 1133,337 C 1257.5714285714287,369.10714285714283 1348.7857142857142,372.05357142857144 1440,375 L 1440,400 L 0,400 Z");
          }
        }
      `}
    </style>
    <path
      d="M 0,400 L 0,150 C 95.78571428571428,154.80357142857144 191.57142857142856,159.60714285714286 307,165 C 422.42857142857144,170.39285714285714 557.5,176.37500000000003 704,210 C 850.5,243.62499999999997 1008.4285714285713,304.89285714285717 1133,337 C 1257.5714285714287,369.10714285714283 1348.7857142857142,372.05357142857144 1440,375 L 1440,400 L 0,400 Z"
      stroke="none"
      strokeWidth="0"
      fill={theme === 'light' ? 'white' : '#030712'}
      fillOpacity="1"
      className="transition-all duration-300 ease-in-out delay-150 path-0"
      transform="rotate(-180 720 200)"
    ></path>
  </svg>
  )
}

export default AnimatedWave