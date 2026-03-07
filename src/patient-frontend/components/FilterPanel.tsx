"use client"

import { useState } from 'react'

export default function FilterPanel({
    specialties,
    activeSpecialty,
    onSpecialtyChange
}: {
    specialties: string[],
    activeSpecialty: string,
    onSpecialtyChange: (s: string) => void
}) {
    return (
        <aside className="w-full md:w-64 flex flex-col gap-8">
            {/* Availability */}
            <div>
                <h4 className="text-sm font-bold text-gray-900 mb-4">Availability</h4>
                <div className="flex flex-col gap-3">
                    <FilterCheckbox label="Available Today" defaultChecked />
                    <FilterCheckbox label="Video Consultant" />
                    <FilterCheckbox label="Available Tomorrow" />
                    <FilterCheckbox label="Accepting New Patients" />
                </div>
            </div>

            {/* Specialty */}
            <div>
                <h4 className="text-sm font-bold text-gray-900 mb-4">Specialty</h4>
                <div className="flex flex-col gap-3">
                    {specialties.map(s => (
                        <label key={s} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="radio"
                                    name="specialty"
                                    className="peer appearance-none w-5 h-5 border border-gray-200 rounded-full checked:border-medical-blue transition-all"
                                    checked={activeSpecialty === s}
                                    onChange={() => onSpecialtyChange(s)}
                                />
                                <div className="absolute w-3 h-3 bg-medical-blue rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                            </div>
                            <span className={`text-sm transition-colors ${activeSpecialty === s ? 'text-medical-blue font-semibold' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                {s}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Gender */}
            <div>
                <h4 className="text-sm font-bold text-gray-900 mb-4">Doctor Gender</h4>
                <div className="flex flex-col gap-3">
                    <FilterCheckbox label="Male" />
                    <FilterCheckbox label="Female" />
                </div>
            </div>
        </aside>
    )
}

function FilterCheckbox({ label, defaultChecked = false }: { label: string, defaultChecked?: boolean }) {
    const [checked, setChecked] = useState(defaultChecked)
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
                <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border border-gray-200 rounded-md checked:bg-medical-blue checked:border-medical-blue transition-all"
                    checked={checked}
                    onChange={() => setChecked(!checked)}
                />
                <span className="absolute text-white text-[10px] scale-0 peer-checked:scale-100 transition-transform font-black">✓</span>
            </div>
            <span className={`text-sm transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-900'}`}>
                {label}
            </span>
        </label>
    )
}
