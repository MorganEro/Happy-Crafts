import React from 'react';
import { FormDescription, FormLabel } from './form';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';

function parseChips(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[,\n]/g)
        .map(t => t.trim())
        .filter(Boolean)
    )
  );
}

function ChipsEditor({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  label?: string;
}) {
  const [raw, setRaw] = React.useState('');
  const addFromRaw = () => {
    const next = [...value, ...parseChips(raw)];
    onChange(Array.from(new Set(next)));
    setRaw('');
  };
  const remove = (idx: number) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {label ? <FormLabel>{label}</FormLabel> : null}
      <div className="flex gap-2">
        <Input
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder={placeholder ?? 'Type and press Enter'}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addFromRaw();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={addFromRaw}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.length === 0 ? (
          <FormDescription className="text-muted-foreground">
            Added options will show here.
          </FormDescription>
        ) : (
          value.map((t, i) => (
            <Badge
              key={`${t}-${i}`}
              variant="secondary"
              className="cursor-pointer hover:opacity-80 capitalize text-base"
              onClick={() => remove(i)}
              title="Click to remove">
              {t} ✕
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

export default ChipsEditor;
