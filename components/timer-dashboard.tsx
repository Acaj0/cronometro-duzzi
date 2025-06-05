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

interface TimerDashboardProps {
  people: Person[]
  activeTimers: TimeRecord[]
  onStartTimer: (personId: string, orderNumber: string) => void
  onStopTimer: (timerId: string) => void
  logoUrl?: string // URL opcional para o logo
}

export function TimerDashboard({ people, activeTimers, onStartTimer, onStopTimer }: TimerDashboardProps) {
  const [selectedPersonId, setSelectedPersonId] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [isDetached, setIsDetached] = useState(false)
  const [isElectron, setIsElectron] = useState(false)
  const [isTimerWindow, setIsTimerWindow] = useState(false)
  const [localTimers, setLocalTimers] = useState<TimeRecord[]>([])

  // Verificar se estamos no Electron e se é uma janela de timer
  // Isso é executado apenas no cliente, evitando erros de hidratação
  useEffect(() => {
    setIsElectron(typeof window !== "undefined" && "electron" in window)

    if (typeof window !== "undefined" && "electron" in window) {
      const isTimer = window.electron.isTimerWindow()
      setIsTimerWindow(isTimer)

      // Registrar listener para atualização de timers
      const removeListener = window.electron.onTimerUpdate((updatedTimers: TimeRecord[]) => {
        if (window.electron.isTimerWindow()) {
          console.log("Timers atualizados na janela destacada", updatedTimers)
          // Atualizar os timers locais na janela destacada
          setLocalTimers(updatedTimers)
        }
      })

      // Registrar listener para inicialização da janela de timers
      const removeInitListener = window.electron.onInitTimerWindow((data) => {
        if (window.electron.isTimerWindow() && data.timers) {
          console.log("Inicializando janela de timers com dados", data)
          // Inicializar os timers locais na janela destacada
          setLocalTimers(data.timers)
        }
      })

      // Registrar listener para quando a janela de timers é fechada
      const removeClosedListener = window.electron.onTimerWindowClosed(() => {
        setIsDetached(false)
      })

      return () => {
        if (removeListener) removeListener()
        if (removeInitListener) removeInitListener()
        if (removeClosedListener) removeClosedListener()
      }
    }
  }, [])

  // Atualizar a janela de timers destacada sempre que os timers ativos mudarem
  useEffect(() => {
    if (isElectron && window.electron && isDetached) {
      console.log("Enviando timers atualizados para a janela destacada:", activeTimers)
      window.electron.updateTimers(activeTimers)
    }
  }, [activeTimers, isElectron, isDetached])

  // Add this function inside the TimerDashboard component
  const personHasActiveTimer = (personId: string) => {
    return activeTimers.some((timer) => timer.personId === personId)
  }

  const handleStartTimer = () => {
    if (selectedPersonId && orderNumber.trim()) {
      // Check if the person already has an active timer
      if (personHasActiveTimer(selectedPersonId)) {
        // You can add a toast notification here if you have a toast system
        console.warn("Esta pessoa já possui um cronômetro ativo")
        return
      }

      onStartTimer(selectedPersonId, orderNumber.trim())
      setOrderNumber("")
    }
  }

  // Add this function inside the TimerDashboard component
  const getPeopleWithoutActiveTimers = () => {
    return people.filter((person) => !personHasActiveTimer(person.id))
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
    // Usar localTimers em vez de activeTimers na janela destacada
    const timersToDisplay = localTimers.length > 0 ? localTimers : activeTimers

    return (
      <div className="p-6 space-y-6">
        {/* Apenas os cronômetros ativos */}
        <Card>
          <CardHeader>
            <CardTitle>Cronômetros Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {timersToDisplay.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum cronômetro ativo.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timersToDisplay.map((timer) => {
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
                  <SelectItem key={person.id} value={person.id} disabled={personHasActiveTimer(person.id)}>
                    {person.name} {personHasActiveTimer(person.id) ? "(Timer ativo)" : ""}
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
          {/* Add this after the Select component in the "Iniciar Novo Cronômetro" card */}
          <div className="col-span-full mt-2">
            <p className="text-sm text-muted-foreground mb-1">Membros disponíveis (sem cronômetros ativos):</p>
            <div className="flex flex-wrap gap-2">
              {getPeopleWithoutActiveTimers().map((person) => (
                <Button
                  key={person.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPersonId(person.id)}
                  className="text-xs"
                >
                  {person.name}
                </Button>
              ))}
              {getPeopleWithoutActiveTimers().length === 0 && (
                <p className="text-xs text-muted-foreground">Todos os membros possuem cronômetros ativos.</p>
              )}
            </div>
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