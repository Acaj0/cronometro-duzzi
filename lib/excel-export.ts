"use client"

import * as XLSX from "xlsx"

export function exportToExcel(data: any[], fileName: string) {
  try {
    // Cria uma nova planilha
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Cria um novo livro e adiciona a planilha
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório")

    // Ajusta a largura das colunas
    const columnsWidth = Object.keys(data[0] || {}).map(() => ({ wch: 20 }))
    worksheet["!cols"] = columnsWidth

    // Exporta o arquivo
    XLSX.writeFile(workbook, fileName)
  } catch (error) {
    console.error("Erro ao exportar para Excel:", error)
    alert("Ocorreu um erro ao exportar para Excel. Por favor, tente novamente.")
  }
}

