import Link from "next/link";
import Image from "next/image";

interface DoctorCardProps {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    experience: string;
    location: string;
    price: string;
    imageUrl: string;
}

export default function DoctorCard({
    id,
    name,
    specialty,
    rating,
    reviews,
    experience,
    location,
    price,
    imageUrl,
}: DoctorCardProps) {
    return (
        <div className="bg-white rounded-3xl border border-border p-5 hover:shadow-xl hover:border-primary/20 transition-all group flex flex-col sm:flex-row gap-6">
            {/* Image Container */}
            <div className="relative w-full sm:w-48 aspect-square rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner group-hover:shadow-none transition-all">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-primary/10">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
            </div>

            {/* Info Container */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                {name}
                            </h3>
                            <p className="text-sm font-medium text-primary bg-primary/5 px-2 py-0.5 rounded inline-block">
                                {specialty}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" className="text-amber-500"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" /></svg>
                            <span className="text-sm font-bold text-amber-700">{rating}</span>
                            <span className="text-[10px] text-amber-600">({reviews} Reviews)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            {experience} Exp.
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                            {location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            {price} JOD
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-6">
                    <Link
                        href={`/doctors/${id}`}
                        className="flex-1 py-2.5 text-center text-sm font-bold text-primary border border-primary/20 bg-primary/5 rounded-xl hover:bg-primary hover:text-white transition-all"
                    >
                        View Profile
                    </Link>
                    <Link
                        href={`/book/${id}`}
                        className="flex-1 py-2.5 text-center text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
                    >
                        Book Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
