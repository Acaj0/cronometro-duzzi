"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Timer } from "@/components/timer"
import type { Person, TimeRecord } from "@/lib/types"

interface TimerDashboardProps {
  people: Person[]
  activeTimers: TimeRecord[]
  onStartTimer: (personId: string, orderNumber: string) => void
  onStopTimer: (timerId: string) => void
}

export function TimerDashboard({ people, activeTimers, onStartTimer, onStopTimer }: TimerDashboardProps) {
  const [selectedPersonId, setSelectedPersonId] = useState("")
  const [orderNumber, setOrderNumber] = useState("")

  const handleStartTimer = () => {
    if (selectedPersonId && orderNumber.trim()) {
      onStartTimer(selectedPersonId, orderNumber.trim())
      setOrderNumber("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleStartTimer()
    }
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
        <CardHeader>
          <CardTitle>Cronômetros Ativos</CardTitle>
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
      </Card>
    </div>
  )
}

