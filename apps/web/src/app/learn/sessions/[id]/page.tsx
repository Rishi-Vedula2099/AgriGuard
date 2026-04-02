"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, DollarSign, Calendar, Star, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { learnApi } from "@/lib/api";

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await learnApi.getSession(id);
        setSession(response.data);
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchSession();
  }, [id]);

  const handleBookSession = async () => {
    setBookingLoading(true);
    try {
      // 1. Create a pending booking
      const bookRes = await learnApi.bookSession({ session_id: id });
      const bookingId = bookRes.data.id;

      // 2. Initiate Razorpay order 
      const orderRes = await learnApi.createOrder({ booking_id: bookingId });
      const { order_id, amount, currency } = orderRes.data;

      // 3. Open Razorpay Widget (assuming script is loaded in Layout)
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder", 
        amount, 
        currency,
        name: "AgriGuard Learn",
        description: `Booking: ${session.title}`,
        order_id,
        handler: async function (response: any) {
          try {
            await learnApi.verifyPayment({
              booking_id: bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            alert("Payment Successful! Booking Confirmed.");
            router.push("/learn/bookings");
          } catch (err) {
            alert("Payment Verification Failed");
          }
        },
        theme: {
          color: "#16a34a"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert("Payment Failed: " + response.error.description);
      });
      rzp.open();
      
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to book session");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  if (!session) return (
    <div className="text-center py-20 mt-16 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Session Not Found</h2>
      <Link href="/learn/sessions" className="text-green-500 hover:text-green-400">Return to Sessions</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 mt-16 pb-24">
      <Link href="/learn/sessions" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
        <ArrowLeft size={16} /> Back to explore
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="h-64 bg-gradient-to-r from-emerald-900 to-green-800 w-full flex items-end p-8">
              <span className={`px-3 py-1 text-sm font-bold rounded-full mb-2 ${
                  session.level === 'BEGINNER' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  session.level === 'INTERMEDIATE' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {session.level} Level
              </span>
            </div>
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-4">{session.title}</h1>
              <div className="flex flex-wrap gap-4 text-gray-300 mb-8 border-b border-gray-700 pb-6">
                <span className="flex items-center gap-2"><Clock size={18} className="text-green-500"/> {session.duration} mins</span>
                <span className="flex items-center gap-2"><Calendar size={18} className="text-green-500"/> Schedule after booking</span>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">About this session</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-8">
                {session.description}
              </p>
                
              <h3 className="text-xl font-semibold mb-4">What you'll learn</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <ShieldCheck size={20} className="text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">Practical farming techniques directly from an experienced expert</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="col-span-1">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 sticky top-24">
            <h3 className="text-xl font-bold border-b border-gray-700 pb-4 mb-4">Booking Summary</h3>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400">Total Price</span>
              <span className="text-3xl font-bold text-white flex items-center">
                <DollarSign size={24} className="text-green-500" /> {session.price}
              </span>
            </div>
            
            <button 
              onClick={handleBookSession}
              disabled={bookingLoading}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-lg mb-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingLoading ? "Processing..." : "Book Now securely"}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">
              Payments processed securely via Razorpay
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mt-6">
            <h4 className="font-bold mb-4 text-lg">Instructor</h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex justify-center items-center text-xl font-bold">
                F
              </div>
              <div>
                <p className="font-medium text-white">Expert Farmer</p>
                <div className="flex items-center gap-1 text-sm text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
