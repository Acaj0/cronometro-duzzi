"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PeopleManager } from "@/components/people-manager"
import { TimerDashboard } from "@/components/timer-dashboard"
import { Reports } from "@/components/reports"
import type { Person, TimeRecord } from "@/lib/types"
import { saveData, loadData } from "@/lib/data-service"

export function MainApp() {
  const [people, setPeople] = useState<Person[]>([])
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([])
  const [activeTimers, setActiveTimers] = useState<TimeRecord[]>([])
  const [isTimerWindow, setIsTimerWindow] = useState(false)

  // Verificar se estamos na janela de timers
  useEffect(() => {
    if (typeof window !== "undefined" && "electron" in window) {
      setIsTimerWindow(window.electron.isTimerWindow && window.electron.isTimerWindow())
    }
  }, [])

  // Carrega dados ao montar o componente
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const loadedPeople = await loadData<Person[]>("people", [])
        const loadedTimeRecords = await loadData<TimeRecord[]>("timeRecords", [])
        const loadedActiveTimers = await loadData<TimeRecord[]>("activeTimers", [])

        setPeople(loadedPeople)
        setTimeRecords(loadedTimeRecords)
        setActiveTimers(loadedActiveTimers)
      } catch (error) {
        console.error("Falha ao carregar dados iniciais:", error)
      }
    }

    loadInitialData()
  }, [])

  // Salva dados sempre que houver alterações
  useEffect(() => {
    const saveAllData = async () => {
      try {
        await saveData("people", people)
        await saveData("timeRecords", timeRecords)
        await saveData("activeTimers", activeTimers)
      } catch (error) {
        console.error("Falha ao salvar dados:", error)
      }
    }

    saveAllData()
  }, [people, timeRecords, activeTimers])

  const addPerson = (name: string) => {
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name,
    }
    setPeople([...people, newPerson])
  }

  const removePerson = (id: string) => {
    setPeople(people.filter((person) => person.id !== id))
  }

  const startTimer = (personId: string, orderNumber: string) => {
    const newTimer: TimeRecord = {
      id: crypto.randomUUID(),
      personId,
      orderNumber,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
    }
    setActiveTimers([...activeTimers, newTimer])
  }

  const stopTimer = (timerId: string) => {
    const now = new Date()
    const timerIndex = activeTimers.findIndex((timer) => timer.id === timerId)

    if (timerIndex !== -1) {
      const timer = activeTimers[timerIndex]
      const startTime = new Date(timer.startTime)
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000) // Duração em segundos

      const completedTimer: TimeRecord = {
        ...timer,
        endTime: now.toISOString(),
        duration,
      }

      // Remove dos cronômetros
      const updatedActiveTimers = [...activeTimers]
      updatedActiveTimers.splice(timerIndex, 1)
      setActiveTimers(updatedActiveTimers)

      // Adiciona aos registros de tempo concluídos
      setTimeRecords([...timeRecords, completedTimer])
    }
  }

  // Se estamos na janela de timers, mostrar apenas o logo e os timers
  if (isTimerWindow) {
    return (
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-44 h-44 mb-2">
            <img src="./duzzi.png" alt="Duzzi Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        <TimerDashboard people={people} activeTimers={activeTimers} onStartTimer={startTimer} onStopTimer={stopTimer} />
      </div>
    )
  }

  // Interface normal para a janela principal
  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex flex-col items-center mb-6">
        <div className="w-44 h-44 mb-2">
          <img src="./duzzi.png" alt="Duzzi Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-center">Monitoramento de Tempo para Montagem de Pedidos</h1>
      </div>

      <Tabs defaultValue="timers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timers">Cronômetros</TabsTrigger>
          <TabsTrigger value="people">Equipe</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="timers">
          <TimerDashboard
            people={people}
            activeTimers={activeTimers}
            onStartTimer={startTimer}
            onStopTimer={stopTimer}
          />
        </TabsContent>

        <TabsContent value="people">
          <PeopleManager people={people} onAddPerson={addPerson} onRemovePerson={removePerson} />
        </TabsContent>

        <TabsContent value="reports">
          <Reports people={people} timeRecords={timeRecords} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

