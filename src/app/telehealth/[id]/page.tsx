"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Video,
    Mic,
    MicOff,
    VideoOff,
    PhoneOff,
    MessageSquare,
    Users,
    Settings,
    Maximize2,
    ShieldCheck,
    Clock
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function TelehealthConsultation() {
    const { id } = useParams()
    const router = useRouter()
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [timeLeft, setTimeLeft] = useState(1740) // 29 minutes

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0)
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
            {/* Top Bar */}
            <header className="p-4 md:px-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-medical-blue rounded-xl flex items-center justify-center text-white font-black text-xl">+</div>
                    <div>
                        <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Live Consultation</div>
                        <div className="text-sm font-black tracking-tight">With Dr. Sarah Mitchell</div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <Clock size={14} className="text-medical-blue" />
                        <span className="text-xs font-mono font-bold">{formatTime(timeLeft)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                        Encrypted
                    </div>
                </div>
            </header>

            {/* Video Area */}
            <main className="flex-1 relative flex overflow-hidden p-4 md:p-8 gap-6">
                <div className="flex-1 relative group">
                    {/* Doctor View */}
                    <div className="w-full h-full rounded-[40px] bg-gray-900 border border-white/5 overflow-hidden relative shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1559839734-2b71f153678f?auto=format&fit=crop&q=80&w=1200"
                            className="w-full h-full object-cover"
                            alt="Doctor"
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60"></div>
                        <div className="absolute bottom-8 left-8">
                            <h2 className="text-lg font-bold">Dr. Sarah Mitchell</h2>
                            <p className="text-xs text-white/60">Cardiology Specialist</p>
                        </div>
                    </div>

                    {/* Self View */}
                    <div className="absolute top-8 right-8 w-40 md:w-64 aspect-video rounded-3xl bg-gray-800 border-2 border-white/10 shadow-2xl overflow-hidden group/self">
                        <div className="w-full h-full bg-linear-to-br from-indigo-500/20 to-purple-500/20 animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white/20">
                            <Video size={48} />
                        </div>
                        <div className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-widest bg-black/40 px-2 py-1 rounded-lg">You (Ammee)</div>
                    </div>

                    {/* Call Controls */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                        <ControlButton
                            icon={isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            onClick={() => setIsMuted(!isMuted)}
                            active={isMuted}
                            color="bg-white/10"
                        />
                        <ControlButton
                            icon={isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                            onClick={() => setIsVideoOff(!isVideoOff)}
                            active={isVideoOff}
                            color="bg-white/10"
                        />
                        <button
                            onClick={() => router.push('/dashboard/patient')}
                            className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/30 hover:scale-110 active:scale-95 transition-all"
                        >
                            <PhoneOff size={24} />
                        </button>
                        <ControlButton
                            icon={<MessageSquare size={20} />}
                            onClick={() => setIsChatOpen(!isChatOpen)}
                            color="bg-white/10"
                        />
                        <ControlButton icon={<Maximize2 size={20} />} color="bg-white/10" />
                    </div>
                </div>

                {/* Side Chat / Info Panel */}
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            className="w-96 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="font-bold">Consultation Chat</h3>
                                <button onClick={() => setIsChatOpen(false)} className="text-white/40 hover:text-white">✕</button>
                            </div>
                            <div className="flex-1 p-6 space-y-4 overflow-y-auto scrollbar-none">
                                <ChatMessage
                                    sender="Doctor Mitchell"
                                    time="10:32 AM"
                                    text="Hello Ammee, how are you feeling today?"
                                />
                                <ChatMessage
                                    sender="You"
                                    time="10:33 AM"
                                    text="I've been feeling a bit better, but the chest tightness persists in the morning."
                                    self
                                />
                                <ChatMessage
                                    sender="Doctor Mitchell"
                                    time="10:34 AM"
                                    text="Let's review your last blood test results together. I'm sharing my screen now."
                                />
                            </div>
                            <div className="p-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-medical-blue transition-all"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-medical-blue font-bold text-xs uppercase cursor-pointer">Send</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer Branding Overlay */}
            <footer className="h-1 bg-medical-blue w-full opacity-50"></footer>
        </div>
    )
}

function ControlButton({ icon, onClick, active = false, color }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-medical-blue text-white' : `${color} text-white/70 hover:bg-white/20 active:scale-95 text-white`}`}
        >
            {icon}
        </button>
    )
}

function ChatMessage({ sender, time, text, self = false }: any) {
    return (
        <div className={`flex flex-col ${self ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{sender}</span>
                <span className="text-[9px] text-white/20">{time}</span>
            </div>
            <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[80%] ${self ? 'bg-medical-blue text-white rounded-tr-none' : 'bg-white/10 text-white/80 rounded-tl-none'}`}>
                {text}
            </div>
        </div>
    )
}
