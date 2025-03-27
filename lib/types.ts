export interface Person {
  id: string
  name: string
}

export interface TimeRecord {
  id: string
  personId: string
  orderNumber: string
  startTime: string
  endTime: string | null
  duration: number // in seconds
}

