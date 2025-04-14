"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Person, TimeRecord } from "@/lib/types"
import { formatTime } from "@/lib/utils"
import { exportToExcel } from "@/lib/excel-export"

interface ReportsProps {
  people: Person[]
  timeRecords: TimeRecord[]
}

export function Reports({ people, timeRecords }: ReportsProps) {
  const [timeFilter, setTimeFilter] = useState("all")
  const [selectedPersonId, setSelectedPersonId] = useState("all")

  // Filtra registros com base no período selecionado
  const filteredRecords = useMemo(() => {
    let filtered = [...timeRecords]
    const now = new Date()

    // Filtra por período de tempo
    if (timeFilter === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      filtered = filtered.filter((record) => record.startTime >= startOfDay)
    } else if (timeFilter === "week") {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // Início da semana atual (domingo)
      startOfWeek.setHours(0, 0, 0, 0)
      filtered = filtered.filter((record) => record.startTime >= startOfWeek.toISOString())
    } else if (timeFilter === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      filtered = filtered.filter((record) => record.startTime >= startOfMonth)
    }

    // Filtra por pessoa
    if (selectedPersonId !== "all") {
      filtered = filtered.filter((record) => record.personId === selectedPersonId)
    }

    return filtered
  }, [timeRecords, timeFilter, selectedPersonId])

  // Calcula estatísticas por pessoa
  const personStats = useMemo(() => {
    const stats: Record<
      string,
      {
        count: number
        totalTime: number
        avgTime: number
        minTime: number
        maxTime: number
      }
    > = {}

    // Inicializa estatísticas para todas as pessoas
    people.forEach((person) => {
      stats[person.id] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Number.POSITIVE_INFINITY,
        maxTime: 0,
      }
    })

    // Calcula estatísticas a partir dos registros filtrados
    filteredRecords.forEach((record) => {
      if (stats[record.personId]) {
        stats[record.personId].count++
        stats[record.personId].totalTime += record.duration

        if (record.duration < stats[record.personId].minTime) {
          stats[record.personId].minTime = record.duration
        }

        if (record.duration > stats[record.personId].maxTime) {
          stats[record.personId].maxTime = record.duration
        }
      }
    })

    // Calcula médias
    Object.keys(stats).forEach((personId) => {
      if (stats[personId].count > 0) {
        stats[personId].avgTime = stats[personId].totalTime / stats[personId].count
      }

      // Corrige o tempo mínimo se não houver registros
      if (stats[personId].minTime === Number.POSITIVE_INFINITY) {
        stats[personId].minTime = 0
      }
    })

    return stats
  }, [people, filteredRecords])

  // Prepara dados para exportação
  const prepareExportData = (type: "summary" | "details") => {
    if (type === "summary") {
      return people.map((person) => {
        const stats = personStats[person.id]
        return {
          Nome: person.name,
          "Pedidos Concluídos": stats.count,
          "Tempo Médio": stats.count > 0 ? formatTime(stats.avgTime) : "-",
          "Tempo Mais Rápido": stats.minTime > 0 ? formatTime(stats.minTime) : "-",
          "Tempo Mais Lento": stats.maxTime > 0 ? formatTime(stats.maxTime) : "-",
        }
      })
    } else {
      return filteredRecords
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .map((record) => {
          const person = people.find((p) => p.id === record.personId)
          return {
            Nome: person?.name || "Desconhecido",
            "Número da Nota": record.orderNumber,
            Data: new Date(record.startTime).toLocaleDateString("pt-BR"),
            "Tempo Gasto": formatTime(record.duration),
          }
        })
    }
  }

  // Exporta para Excel
  const handleExportExcel = (type: "summary" | "details") => {
    const data = prepareExportData(type)
    const fileName =
      type === "summary" ? "relatorio-resumo-montagem-pedidos.xlsx" : "relatorio-detalhado-montagem-pedidos.xlsx"

    exportToExcel(data, fileName)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios de Desempenho</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o Período</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-1/2">
            <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o membro da equipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Membros</SelectItem>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="details">Registros Detalhados</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportExcel("summary")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar para Excel
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro da Equipe</TableHead>
                  <TableHead>Pedidos Concluídos</TableHead>
                  <TableHead>Tempo Médio</TableHead>
                  <TableHead>Tempo Mais Rápido</TableHead>
                  <TableHead>Tempo Mais Lento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum membro da equipe adicionado ainda
                    </TableCell>
                  </TableRow>
                ) : (
                  people.map((person) => {
                    const stats = personStats[person.id]
                    return (
                      <TableRow key={person.id}>
                        <TableCell>{person.name}</TableCell>
                        <TableCell>{stats.count}</TableCell>
                        <TableCell>{stats.count > 0 ? formatTime(stats.avgTime) : "-"}</TableCell>
                        <TableCell>{stats.minTime > 0 ? formatTime(stats.minTime) : "-"}</TableCell>
                        <TableCell>{stats.maxTime > 0 ? formatTime(stats.maxTime) : "-"}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="details">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportExcel("details")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar para Excel
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro da Equipe</TableHead>
                  <TableHead>Nota #</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tempo Gasto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum registro encontrado para os filtros selecionados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                    .map((record) => {
                      const person = people.find((p) => p.id === record.personId)
                      return (
                        <TableRow key={record.id}>
                          <TableCell>{person?.name || "Desconhecido"}</TableCell>
                          <TableCell>{record.orderNumber}</TableCell>
                          <TableCell>{new Date(record.startTime).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell>{formatTime(record.duration)}</TableCell>
                        </TableRow>
                      )
                    })
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}