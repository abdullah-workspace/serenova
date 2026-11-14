export default function SlotChips({ slots, value, onChange, legend = 'Preferred time' }) {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      <div className="slot-grid">
        {slots.map((slot) => {
          const id = `slot-${slot.startAt.replace(/[^0-9]/g, '')}`;
          return (
            <div className="pick" key={slot.startAt}>
              <input
                type="radio"
                id={id}
                name="slot"
                value={slot.startAt}
                checked={value === slot.startAt}
                onChange={() => onChange(slot.startAt)}
                onKeyDown={(event) => {
                  if (event.key === ' ') {
                    event.preventDefault();
                    onChange(slot.startAt);
                  }
                }}
              />
              <label htmlFor={id}>{slot.label}</label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
