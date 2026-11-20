import { useState } from 'react';
import { CalendarDatePicker, CalendarView, ComboBox, DatePicker, TimePicker } from '../../lib';
import { Example, Page } from '../Example';

export function DateTimePage() {
  const [day, setDay] = useState<Date | null>(new Date());
  const [date, setDate] = useState<Date | null>(null);
  const [picked, setPicked] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [first, setFirst] = useState('Sunday');

  return (
    <Page
      title="Date & time"
      description="Calendar and looping-selector pickers. The picker flyouts open over the control, expanding outward from it."
    >
      <Example
        title="CalendarView"
        description="Click the month name to zoom out to the year, then the decade. Scroll or use the arrows to move."
        code={`<CalendarView value={day} onValueChange={setDay} firstDayOfWeek={1} />`}
        options={
          <>
            <ComboBox header="First day of week" items={['Sunday', 'Monday', 'Saturday']} value={first} onValueChange={setFirst} />
            <span className="g-out">Selected: {day ? day.toDateString() : 'nothing'}</span>
          </>
        }
      >
        <CalendarView
          value={day}
          onValueChange={setDay}
          firstDayOfWeek={first === 'Monday' ? 1 : first === 'Saturday' ? 6 : 0}
        />
      </Example>

      <Example
        title="CalendarDatePicker"
        code={`<CalendarDatePicker header="Arrival date" value={date} onValueChange={setDate} />`}
      >
        <CalendarDatePicker header="Arrival date" value={date} onValueChange={setDate} />
        <span className="g-out" style={{ alignSelf: 'flex-end', paddingBottom: 8 }}>
          {date ? date.toDateString() : 'No date picked'}
        </span>
      </Example>

      <Example
        title="DatePicker"
        description="Scroll each column, click a value, or use the arrow keys. The tick accepts the choice."
        code={`<DatePicker header="Date of birth" value={date} onValueChange={setDate} />`}
      >
        <DatePicker header="Pick a date" value={picked} onValueChange={setPicked} />
        <span className="g-out" style={{ alignSelf: 'flex-end', paddingBottom: 8 }}>
          {picked ? picked.toDateString() : 'No date picked'}
        </span>
      </Example>

      <Example
        title="TimePicker"
        code={`<TimePicker header="Alarm" value={time} onValueChange={setTime} minuteIncrement={5} />
<TimePicker clock="24" defaultValue="18:30" />`}
      >
        <TimePicker header="Alarm (5-minute steps)" value={time} onValueChange={setTime} minuteIncrement={5} />
        <TimePicker header="24-hour clock" clock="24" defaultValue="18:30" style={{ minWidth: 0 }} />
        <span className="g-out" style={{ alignSelf: 'flex-end', paddingBottom: 8 }}>
          {time ? `Value: ${time}` : 'No time picked'}
        </span>
      </Example>
    </Page>
  );
}
