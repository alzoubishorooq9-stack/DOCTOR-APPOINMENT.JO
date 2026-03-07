"use client"

import { useState, useEffect } from 'react'
import { User, Mail, Save, Image as ImageIcon } from 'lucide-react'

export default function ProfileManager() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form states
    const [fullName, setFullName] = useState('')
    const [bio, setBio] = useState('')
    const [specialty, setSpecialty] = useState('')
    const [experienceYears, setExperienceYears] = useState('')
    const [location, setLocation] = useState('')

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/doctor/profile')
                const data = await res.json()
                if (data.id) {
                    setProfile(data)
                    setFullName(data.full_name || '')
                    setBio(data.details?.bio || '')
                    setSpecialty(data.details?.specialty || '')
                    setExperienceYears(data.details?.experience_years?.toString() || '')
                    setLocation(data.details?.location || '')
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await fetch('/api/doctor/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName,
                    bio: bio,
                    specialty,
                    experience_years: parseInt(experienceYears, 10),
                    location
                })
            })
            alert("Profile updated successfully!")
        } catch (e) {
            console.error(e)
            alert("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="p-10 text-center text-gray-500">Loading profile data...</div>
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Professional Profile</h1>
                <p className="text-gray-500 mt-1 text-sm font-medium">Manage your public information visible to patients.</p>
            </div>

            <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-8">

                {/* Avatar Section */}
                <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
                    <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-gray-100 flex flex-col items-center justify-center text-gray-400 overflow-hidden relative">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={32} />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            id="avatar-upload"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                setSaving(true)
                                try {
                                    const formData = new FormData()
                                    formData.append('avatar', file)
                                    const res = await fetch('/api/doctor/profile/avatar', {
                                        method: 'POST',
                                        body: formData
                                    })
                                    const data = await res.json()
                                    if (data.avatar_url) {
                                        setProfile({ ...profile, avatar_url: data.avatar_url })
                                        alert('Profile picture uploaded successfully!')
                                    } else {
                                        alert(data.error || 'Upload failed')
                                    }
                                } catch (err) {
                                    console.error(err)
                                    alert('Upload failed')
                                } finally {
                                    setSaving(false)
                                }
                            }}
                        />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Profile Picture</h3>
                        <p className="text-sm text-gray-500 mb-3">A friendly, professional photo builds trust with patients.</p>
                        <button
                            type="button"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <ImageIcon size={16} /> Upload Photo
                        </button>
                    </div>
                </div>

                {/* Info Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                            placeholder="e.g. Dr. Jane Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Specialty</label>
                        <input
                            type="text"
                            required
                            value={specialty}
                            onChange={e => setSpecialty(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                            placeholder="e.g. Cardiology"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Years of Experience</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={experienceYears}
                            onChange={e => setExperienceYears(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                            placeholder="e.g. 10"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Clinic Location</label>
                        <input
                            type="text"
                            required
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                            placeholder="e.g. 5th Circle, Amman"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Professional Bio</label>
                        <textarea
                            required
                            rows={4}
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all resize-y"
                            placeholder="Tell patients about your medical background, approach to care, and achievements."
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    )
}
