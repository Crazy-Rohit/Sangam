type FieldListProps = {
  fields: { label: string; value: string; note?: string }[]
}

export function FieldList({ fields }: FieldListProps) {
  return (
    <dl className="field-list">
      {fields.map((field) => (
        <div key={field.label} className="field-row">
          <dt>{field.label}</dt>
          <dd>
            <span>{field.value}</span>
            {field.note ? <span className="sim-tag">{field.note}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}
