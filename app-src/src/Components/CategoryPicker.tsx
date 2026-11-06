import { useNavigate, useSearch } from '@tanstack/react-location'
import { useQuery } from '@tanstack/react-query'
import { KeyboardEvent, useId, useRef, useState } from 'react'
import { listEfnisflokkar } from '../db'
import { islenskSamanburdur } from '../islenskRod'
import { MyLocationGenerics } from './Generics'
import './CategoryPicker.css'

const normalize = (text: string) => text.trim().toLocaleLowerCase('is')

function selectedLabel(count: number) {
    if (count == 0) return 'Allir flokkar'
    const singular = count % 10 == 1 && count % 100 != 11
    return singular ? `${count} flokkur valinn` : `${count} flokkar valdir`
}

// Category ("efnisflokkur") picker shown under the search box. The selection
// lives in the URL (?efnisflokkur=[...]) so reload and back/forward keep it.
export function CategoryPicker() {
    const search = useSearch<MyLocationGenerics>()
    const navigate = useNavigate<MyLocationGenerics>()
    const selected = search.efnisflokkur ?? []
    const [open, setOpen] = useState(false)
    const [filter, setFilter] = useState('')
    const toggleRef = useRef<HTMLButtonElement>(null)
    const id = useId()

    const {
        data: categories = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['efnisflokkar'],
        queryFn: listEfnisflokkar,
        staleTime: Infinity,
        cacheTime: Infinity,
    })

    const setSelected = (next: string[]) => {
        navigate({
            search: (old) => ({
                ...old,
                efnisflokkur: next.length ? next : undefined,
                page: 1,
                scroll: 0,
            }),
        })
    }

    const isSelected = (name: string) =>
        selected.some((s) => normalize(s) == normalize(name))

    const toggle = (name: string) => {
        setSelected(
            isSelected(name)
                ? selected.filter((s) => normalize(s) != normalize(name))
                : [...selected, name]
        )
    }

    const visible = filter.trim()
        ? categories.filter((c) =>
              normalize(c.name).includes(normalize(filter))
          )
        : categories

    const sortedSelected = [...selected].sort(islenskSamanburdur)

    const onKeyDown = (ev: KeyboardEvent) => {
        if (ev.key == 'Escape' && open) {
            ev.stopPropagation()
            setOpen(false)
            toggleRef.current?.focus()
        }
    }

    return (
        <div className="category-picker" onKeyDown={onKeyDown}>
            <div className="category-picker-bar">
                <button
                    type="button"
                    ref={toggleRef}
                    className="category-picker-toggle"
                    aria-expanded={open}
                    aria-controls={`${id}-panel`}
                    onClick={() => setOpen(!open)}
                >
                    <span className="category-picker-title">Efnisflokkar:</span>
                    <span className="category-picker-summary">
                        {selectedLabel(selected.length)}
                    </span>
                    <span className="material-icons" aria-hidden="true">
                        {open ? 'expand_less' : 'expand_more'}
                    </span>
                </button>
                {selected.length > 0 && (
                    <button
                        type="button"
                        className="category-picker-clear"
                        onClick={() => setSelected([])}
                    >
                        Hreinsa flokkaval
                    </button>
                )}
            </div>

            {open && (
                <div
                    id={`${id}-panel`}
                    className="category-picker-panel"
                    role="group"
                    aria-label="Velja efnisflokka"
                >
                    <label
                        htmlFor={`${id}-filter`}
                        className="category-picker-visually-hidden"
                    >
                        Leita að efnisflokki
                    </label>
                    <input
                        id={`${id}-filter`}
                        type="search"
                        className="category-picker-filter"
                        placeholder="Leita að efnisflokki"
                        value={filter}
                        onChange={(ev) => setFilter(ev.target.value)}
                        autoComplete="off"
                    />
                    {isLoading && (
                        <p className="category-picker-message">
                            Sæki efnisflokka…
                        </p>
                    )}
                    {isError && (
                        <p className="category-picker-message">
                            Ekki tókst að sækja efnisflokka.{' '}
                            <button type="button" onClick={() => refetch()}>
                                Reyna aftur
                            </button>
                        </p>
                    )}
                    {!isLoading && !isError && visible.length == 0 && (
                        <p className="category-picker-message" role="status">
                            Enginn efnisflokkur passar við „{filter.trim()}“.
                        </p>
                    )}
                    {visible.length > 0 && (
                        <ul className="category-picker-list">
                            {visible.map((category) => (
                                <li key={category.name}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={isSelected(category.name)}
                                            onChange={() =>
                                                toggle(category.name)
                                            }
                                        />
                                        <span>{category.name}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {sortedSelected.length > 0 && (
                <ul className="category-chips" aria-label="Valdir efnisflokkar">
                    {sortedSelected.map((name) => (
                        <li key={name}>
                            <button
                                type="button"
                                className="category-chip"
                                aria-label={`Fjarlægja efnisflokkinn ${name}`}
                                onClick={() => toggle(name)}
                            >
                                <span>{name}</span>
                                <span
                                    className="material-icons"
                                    aria-hidden="true"
                                >
                                    close
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
