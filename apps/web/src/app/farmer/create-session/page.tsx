"use client";

import { useState, useEffect } from "react";
import { DollarSign, Clock, BookOpen, User, PlusCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { learnApi } from "@/lib/api";

export default function CreateSessionPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        crop_id: "",
        level: "BEGINNER",
        price: 499,
        duration: 60,
        meeting_link: ""
    });
    const [loading, setLoading] = useState(false);

    const [crops, setCrops] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const res = await learnApi.getCrops();
                setCrops(res.data);
            } catch (err) {
                console.error("Failed to fetch crops", err);
            }
        };
        fetchCrops();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "price" || name === "duration" ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.crop_id) {
            alert("Please select a crop");
            return;
        }

        setLoading(true);
        try {
            await learnApi.createSession(formData);
            router.push("/farmer/my-sessions");
        } catch (err: any) {
            console.error(err);
            alert((err as any).response?.data?.detail || "Failed to create session");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 mt-16 pb-24">
            <div className="mb-8">
                <Link href="/farmer/my-sessions" className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition w-fit">
                    <ArrowLeft size={16} /> Back to dashboard
                </Link>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <PlusCircle className="text-green-500" /> Host a New Session
                </h1>
                <p className="text-gray-400">Share your expertise and build the next generation of farmers.</p>
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Session Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Advanced Organic Rice Cultivation"
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="What will students learn in this session?"
                                required
                                rows={4}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Crop Type</label>
                                <select
                                    name="crop_id"
                                    value={formData.crop_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition appearance-none"
                                >
                                    {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty Level</label>
                                <select
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition appearance-none"
                                >
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Price (₹)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min={100}
                                        required
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-green-500 transition"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    * Platform takes a varying commission cut (e.g. 25-75%) based on DB config
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Duration (minutes)</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        min={15}
                                        max={240}
                                        step={15}
                                        required
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-green-500 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Meeting Link (Optional)</label>
                            <input
                                type="url"
                                name="meeting_link"
                                value={formData.meeting_link}
                                onChange={handleChange}
                                placeholder="https://meet.google.com/..."
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition"
                            />
                        </div>

                    </div>

                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex gap-4 mt-6">
                        <BookOpen className="text-blue-500 shrink-0" />
                        <p className="text-sm text-gray-400">
                            By creating this session, you agree to AgriGuard&apos;s teaching terms. Make sure your microphone and camera setup are ready before the session begins.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white rounded-xl py-4 font-bold text-lg transition disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading ? "Publishing..." : "Publish Session"}
                    </button>
                </form>
            </div>
        </div>
    );
}
