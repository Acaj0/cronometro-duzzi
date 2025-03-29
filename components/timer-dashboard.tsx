"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Timer } from "@/components/timer"
import type { Person, TimeRecord } from "@/lib/types"
import { Maximize2 } from "lucide-react"
import Image from "next/image"

interface TimerDashboardProps {
  people: Person[]
  activeTimers: TimeRecord[]
  onStartTimer: (personId: string, orderNumber: string) => void
  onStopTimer: (timerId: string) => void
  logoUrl?: string // URL opcional para o logo
}

export function TimerDashboard({
  people,
  activeTimers,
  onStartTimer,
  onStopTimer,
}: TimerDashboardProps) {
  const [selectedPersonId, setSelectedPersonId] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [isDetached, setIsDetached] = useState(false)
  const [isElectron, setIsElectron] = useState(false)
  const [isTimerWindow, setIsTimerWindow] = useState(false)

  // Verificar se estamos no Electron e se é uma janela de timer
  // Isso é executado apenas no cliente, evitando erros de hidratação
  useEffect(() => {
    setIsElectron(typeof window !== "undefined" && "electron" in window)

    if (typeof window !== "undefined" && "electron" in window) {
      setIsTimerWindow(window.electron.isTimerWindow())

      // Registrar listener para atualização de timers
      const removeListener = window.electron.onTimerUpdate((updatedTimers: TimeRecord[]) => {
        if (window.electron.isTimerWindow()) {
          console.log("Timers atualizados na janela destacada", updatedTimers)
        }
      })

      // Registrar listener para quando a janela de timers é fechada
      const removeClosedListener = window.electron.onTimerWindowClosed(() => {
        setIsDetached(false)
      })

      return () => {
        if (removeListener) removeListener()
        if (removeClosedListener) removeClosedListener()
      }
    }
  }, [])

  const handleStartTimer = () => {
    if (selectedPersonId && orderNumber.trim()) {
      onStartTimer(selectedPersonId, orderNumber.trim())
      setOrderNumber("")
      
      if (isDetached && window.electron) {
        // Enviar a lista atualizada de timers para a janela destacada
        window.electron.updateTimers(activeTimers)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleStartTimer()
    }
  }

  const handleDetachTimers = () => {
    if (isElectron && window.electron) {
      window.electron.detachTimers(activeTimers)
      setIsDetached(true)
    }
  }

  // Se estamos na janela de timers, mostrar apenas os timers e o logo
  if (isTimerWindow) {
    return (
      <div className="p-6 space-y-6">
        
        {/* Apenas os cronômetros ativos */}
        <Card>
          <CardHeader>
            <CardTitle>Cronômetros Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTimers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum cronômetro ativo.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTimers.map((timer) => {
                  const person = people.find((p) => p.id === timer.personId)
                  return (
                    <Timer
                      key={timer.id}
                      timer={timer}
                      personName={person?.name || "Desconhecido"}
                      onStop={() => onStopTimer(timer.id)}
                    />
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Iniciar Novo Cronômetro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o membro da equipe" />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Número da nota"
              value={orderNumber}
              type="number"
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <Button onClick={handleStartTimer} disabled={!selectedPersonId || !orderNumber.trim()}>
              Iniciar Cronômetro
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cronômetros Ativos</CardTitle>
          {isElectron && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDetachTimers}
              disabled={isDetached} // Removida a condição activeTimers.length === 0
              title="Destacar cronômetros em uma nova janela"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Destacar Timers
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {activeTimers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum cronômetro ativo. Inicie um novo cronômetro acima.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTimers.map((timer) => {
                const person = people.find((p) => p.id === timer.personId)
                return (
                  <Timer
                    key={timer.id}
                    timer={timer}
                    personName={person?.name || "Desconhecido"}
                    onStop={() => onStopTimer(timer.id)}
                  />
                )
              })}
            </div>
          )}
        </CardContent>
        {isDetached && (
          <CardFooter>
            <p className="text-sm text-muted-foreground">Os cronômetros estão sendo exibidos em uma janela separada.</p>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

