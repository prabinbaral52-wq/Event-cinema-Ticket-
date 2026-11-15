import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Film, Plus, Users, DollarSign, Clock } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  poster?: string;
  showtime: string;
  createdAt?: any;
}

interface Booking {
  id: string;
  movieId: string;
  seats: string[];
  payment: 'online' | 'cash';
  amount: number;
  timestamp: number;
}

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [title, setTitle] = useState('');
  const [showtime, setShowtime] = useState('');
  const [poster, setPoster] = useState('');

  // Live movies
  useEffect(() => {
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setMovies(snap.docs.map(d => ({ id: d.id, ...d.data() } as Movie)));
    });
  }, []);

  // Live bookings
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
    });
  }, []);

  const postMovie = async () => {
    if (!title || !showtime) return alert('Title and showtime required');
    await addDoc(collection(db, 'movies'), {
      title,
      showtime,
      poster: poster || '',
      createdAt: serverTimestamp()
    });
    setTitle(''); setShowtime(''); setPoster('');
    alert('Movie posted — customers will see it live');
  };

  const totalIncome = bookings
    .filter(b => b.payment === 'online')
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const bookedSeats = bookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Film className="text-red-500" /> Event Cinema — Admin
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400"><Users size={18} /> Seats Booked</div>
          <div className="text-3xl font-bold mt-1">{bookedSeats} / 192</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400"><DollarSign size={18} /> Online Income</div>
          <div className="text-3xl font-bold mt-1">Rs. {totalIncome}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400"><Clock size={18} /> Movies</div>
          <div className="text-3xl font-bold mt-1">{movies.length}</div>
        </div>
      </div>

      {/* Post Movie */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus /> Post New Movie</h2>
        <div className="grid gap-3 max-w-md">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Movie title" className="bg-slate-800 px-3 py-2 rounded" />
          <input value={showtime} onChange={e => setShowtime(e.target.value)} placeholder="Showtime (e.g. 3:30 PM)" className="bg-slate-800 px-3 py-2 rounded" />
          <input value={poster} onChange={e => setPoster(e.target.value)} placeholder="Poster image URL (optional)" className="bg-slate-800 px-3 py-2 rounded" />
          <button onClick={postMovie} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium">Post Movie</button>
        </div>
      </div>

      {/* Movies list */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Posted Movies</h2>
        <div className="space-y-2">
          {movies.map(m => (
            <div key={m.id} className="bg-slate-900 p-3 rounded border border-slate-800 flex justify-between">
              <div>
                <div className="font-medium">{m.title}</div>
                <div className="text-sm text-slate-400">{m.showtime}</div>
              </div>
            </div>
          ))}
          {movies.length === 0 && <p className="text-slate-500">No movies yet</p>}
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Bookings</h2>
        <div className="space-y-2">
          {bookings.slice(0, 10).map(b => (
            <div key={b.id} className="bg-slate-900 p-3 rounded border border-slate-800 text-sm">
              Seats: {b.seats?.join(', ') || '—'} · {b.payment} · Rs. {b.amount}
            </div>
          ))}
          {bookings.length === 0 && <p className="text-slate-500">No bookings yet</p>}
        </div>
      </div>
    </div>
  );
}
