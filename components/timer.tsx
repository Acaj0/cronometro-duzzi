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

  useEffect(() => {
    const startTime = new Date(timer.startTime).getTime()

    // Atualiza o tempo decorrido imediatamente
    setElapsedTime(Math.floor((Date.now() - startTime) / 1000))

    // Em seguida, atualiza a cada segundo
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [timer.startTime])

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">{personName}</span>
            <span className="text-sm text-muted-foreground">Nota #{timer.orderNumber}</span>
          </div>
          <div className="text-3xl font-bold text-center py-4">{formatTime(elapsedTime)}</div>
          <div className="text-xs text-muted-foreground">
            Iniciado: {new Date(timer.startTime).toLocaleString("pt-BR")}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted p-2">
        <Button variant="destructive" className="w-full" onClick={onStop}>
          Finalizar
        </Button>
      </CardFooter>
    </Card>
  )
}

