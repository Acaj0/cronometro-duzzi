"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { TimeRecord } from "@/lib/types"
import { formatTime } from "@/lib/utils"

interface TimerProps {
  timer: TimeRecord
  personName: string
  onStop: () => void
}

export function Timer({ timer, personName, onStop }: TimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [buttonStyle, setButtonStyle] = useState({
    backgroundColor: "rgb(22, 163, 74)", // Verde inicial
    color: "white",
  })

  useEffect(() => {
    const startTime = new Date(timer.startTime).getTime()

    // Atualiza o tempo decorrido imediatamente
    const updateElapsedTime = () => {
      const seconds = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(seconds)

      // Calcula a cor com base no tempo decorrido (1 hora = 3600 segundos)
      const hourProgress = Math.min(seconds / 3600, 1) // Valor entre 0 e 1

      // Transição de cores: verde -> amarelo -> vermelho -> preto
      let backgroundColor
      let textColor = "white"

      if (hourProgress < 0.33) {
        // Verde para amarelo
        const greenValue = 163 - (163 - 202) * (hourProgress / 0.33)
        const redValue = 22 + (234 - 22) * (hourProgress / 0.33)
        backgroundColor = `rgb(${redValue}, ${greenValue}, 74)`
      } else if (hourProgress < 0.66) {
        // Amarelo para vermelho
        const normalizedProgress = (hourProgress - 0.33) / 0.33
        const greenValue = 202 - 202 * normalizedProgress
        backgroundColor = `rgb(234, ${greenValue}, 74)`
      } else {
        // Vermelho para preto
        const normalizedProgress = (hourProgress - 0.66) / 0.34
        const redValue = 234 - 234 * normalizedProgress
        const greenValue = 74 * (1 - normalizedProgress)
        backgroundColor = `rgb(${redValue}, ${greenValue}, ${greenValue})`

        // Ajusta a cor do texto para melhor contraste quando o fundo escurece
        if (normalizedProgress > 0.7) {
          textColor = "white"
        }
      }

      setButtonStyle({
        backgroundColor,
        color: textColor,
      })
    }

    updateElapsedTime()

    // Em seguida, atualiza a cada segundo
    const interval = setInterval(updateElapsedTime, 1000)

    return () => clearInterval(interval)
  }, [timer.startTime])

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex flex-col justify-between items-center">
            <span className="font-bold text-5xl">{personName}</span>
            <span className="text-xl text-muted-foreground">Nota #{timer.orderNumber}</span>
          </div>
          <div className="text-6xl font-bold text-center py-4">{formatTime(elapsedTime)}</div>
          <div className="text-xs text-muted-foreground">
            Iniciado: {new Date(timer.startTime).toLocaleString("pt-BR")}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted p-2">
        <Button onClick={onStop} className="w-full transition-colors duration-300" style={buttonStyle}>
          Finalizar
        </Button>
      </CardFooter>
    </Card>
  )
}