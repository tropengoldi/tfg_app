'use client'

import { CalendarIcon } from 'lucide-react'
import { parseISO } from 'date-fns'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatEventDate, toISODate } from '@/lib/dates'
import { cn } from '@/lib/utils'

interface EventDateFieldProps {
  /** `yyyy-MM-dd` oder '' */
  value: string
  onChange: (value: string) => void
  id?: string
}

/** Datumsauswahl über einen Kalender; Tage vor heute sind gesperrt. */
export function EventDateField({ value, onChange, id }: EventDateFieldProps) {
  const [open, setOpen] = React.useState(false)
  const selected = value ? parseISO(value) : undefined
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {value ? formatEventDate(value) : 'Datum wählen'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? today}
          disabled={{ before: today }}
          onSelect={(d) => {
            if (d) onChange(toISODate(d))
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
