export interface Task {
  id: string
  title: string
  is_completed: boolean
  target_date: string | null
  position: number
  created_at: string
}

export interface NewTask {
  title: string
  target_date: string | null
}

export interface UpdateTask {
  title?: string
  is_completed?: boolean
  target_date?: string | null
  position?: number
}

export interface DateTaskCount {
  active: number
  completed: number
}
