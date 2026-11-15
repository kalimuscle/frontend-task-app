import { Combobox } from '@base-ui/react/combobox'
import { useId, useMemo } from 'react'
import { useSessionQuery } from '../../features/auth/use-auth'
import { useUsers } from '../../features/tasks/use-users'
import type { UserSummary } from '../../lib/api/users'

const assigneeFilter = (item: unknown, query: string) => {
  const user = typeof item === 'string' ? undefined : (item as UserSummary)
  const haystack = user ? `${user.name} ${user.email}` : String(item)

  return haystack.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es'))
}

export function AssigneeCombobox({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const inputId = useId()
  const usersQuery = useUsers()
  const { data: session } = useSessionQuery()

  const users = useMemo(
    () =>
      [...(usersQuery.data ?? [])].sort((left, right) => {
        const byName = left.name.localeCompare(right.name, 'es')

        return byName === 0 ? left.email.localeCompare(right.email, 'es') : byName
      }),
    [usersQuery.data],
  )

  const items = useMemo(
    () =>
      Combobox.createItems(users, {
        getValue: (user) => user.id,
        getLabel: (user) => user.name,
      }),
    [users],
  )

  if (usersQuery.isError) {
    return (
      <div className="assignee-combobox">
        <label className="assignee-combobox__label" htmlFor={inputId}>
          Responsable
        </label>
        <input
          id={inputId}
          type="text"
          className="assignee-combobox__input"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        <p className="assignee-combobox__hint">
          El listado de usuarios no está disponible en el servidor. Puedes
          escribir el identificador del responsable; el tuyo es{' '}
          {session?.user.id ?? '—'}.
        </p>
      </div>
    )
  }

  return (
    <div className="assignee-combobox">
      <label className="assignee-combobox__label" htmlFor={inputId}>
        Responsable
      </label>
      <Combobox.Root
        items={items}
        value={value || null}
        filter={assigneeFilter}
        onValueChange={(next) => {
          if (typeof next === 'string') {
            onChange(next)
          }
        }}
      >
        <Combobox.Input
          id={inputId}
          className="assignee-combobox__input"
          disabled={disabled}
        />
        <Combobox.Portal>
          <Combobox.Positioner>
            <Combobox.Popup className="assignee-combobox__popup">
              <Combobox.Empty className="assignee-combobox__empty">
                Sin resultados
              </Combobox.Empty>
              <Combobox.List className="assignee-combobox__list">
                {(user: UserSummary) => (
                  <Combobox.Item
                    key={user.id}
                    value={user.id}
                    className="assignee-combobox__item"
                  >
                    <span className="assignee-combobox__name">{user.name}</span>
                    <span className="assignee-combobox__email">{user.email}</span>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  )
}
