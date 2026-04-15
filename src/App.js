import React, { useState, useEffect } from 'react';
import { Dumbbell, ArrowLeft, Trash2, Plus, CheckCircle, Search, Edit3 } from 'lucide-react';
import { db } from './firebase'; 
import { 
  collection, addDoc, onSnapshot, deleteDoc, doc, 
  query, orderBy, serverTimestamp, updateDoc 
} from 'firebase/firestore';

function App() {
  const [isCreating, setIsCreating] = useState(false);
  const [editId, setEditId] = useState(null); // Track if we are editing
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState([]); 
  const [workouts, setWorkouts] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(""); // Search state

  useEffect(() => {
    const q = query(collection(db, "workouts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Filter workouts based on search
  const filteredWorkouts = workouts.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addExerciseField = () => {
    setExercises([...exercises, { id: Date.now(), name: "", sets: "", reps: "" }]);
  };

  const handleSave = async () => {
    if (workoutName.trim() === "" || exercises.length === 0) return;
    
    try {
      if (editId) {
        // UPDATE existing workout
        await updateDoc(doc(db, "workouts", editId), {
          name: workoutName,
          data: exercises
        });
      } else {
        // SAVE new workout
        await addDoc(collection(db, "workouts"), {
          name: workoutName,
          data: exercises,
          createdAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (e) { console.error(e); }
  };

  const startEdit = (workout) => {
    setEditId(workout.id);
    setWorkoutName(workout.name);
    setExercises(workout.data);
    setIsCreating(true);
  };

  const resetForm = () => {
    setWorkoutName("");
    setExercises([]);
    setEditId(null);
    setIsCreating(false);
  };

  const deleteWorkout = async (id) => {
    if (window.confirm("Delete this routine?")) await deleteDoc(doc(db, "workouts", id));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 md:p-8">
      <header className="text-center mb-10">
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Dumbbell size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Quest Fitness</h1>
      </header>

      {!isCreating ? (
        <div className="w-full max-w-md">
          {/* SEARCH BAR */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search routines..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3.5 pl-12 bg-white rounded-2xl shadow-sm border-none outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4 mb-8">
            {filteredWorkouts.map((w) => (
              <div key={w.id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div onClick={() => startEdit(w)} className="cursor-pointer flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{w.name}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      {w.createdAt?.seconds ? new Date(w.createdAt.seconds * 1000).toLocaleDateString() : "Syncing..."}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(w)} className="text-gray-300 hover:text-blue-500"><Edit3 size={18}/></button>
                    <button onClick={() => deleteWorkout(w.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {w.data?.map(ex => (
                    <div key={ex.id} className="flex justify-between bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <span className="text-sm font-semibold text-gray-600">{ex.name}</span>
                      <span className="text-xs font-bold text-blue-600">{ex.sets} × {ex.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setIsCreating(true)} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg">+ New Routine</button>
        </div>
      ) : (
        /* CREATE/EDIT FORM */
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6">
          <button onClick={resetForm} className="flex items-center text-gray-400 mb-6 font-bold"><ArrowLeft size={20} className="mr-2" /> Back</button>
          <h2 className="text-2xl font-black mb-6">{editId ? "Edit Routine" : "New Routine"}</h2>
          
          <input 
            type="text" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Routine Title" className="w-full p-4 bg-gray-50 rounded-2xl mb-6 outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {exercises.map((ex, index) => (
            <div key={ex.id} className="p-4 bg-gray-50 rounded-2xl border mb-4 flex flex-col gap-3">
              <input 
                placeholder="Exercise Name" value={ex.name}
                className="bg-transparent border-b border-gray-200 py-1 outline-none font-semibold"
                onChange={(e) => {
                  const newEx = [...exercises];
                  newEx[index].name = e.target.value;
                  setExercises(newEx);
                }}
              />
              <div className="flex gap-4">
                <input placeholder="Sets" type="number" value={ex.sets} className="w-full p-2 rounded-lg border text-center font-bold" onChange={(e) => {
                  const newEx = [...exercises];
                  newEx[index].sets = e.target.value;
                  setExercises(newEx);
                }} />
                <input placeholder="Reps" type="number" value={ex.reps} className="w-full p-2 rounded-lg border text-center font-bold" onChange={(e) => {
                  const newEx = [...exercises];
                  newEx[index].reps = e.target.value;
                  setExercises(newEx);
                }} />
              </div>
            </div>
          ))}

          <button onClick={addExerciseField} className="w-full mb-6 flex items-center justify-center gap-2 text-blue-600 font-bold py-3 border-2 border-dashed border-blue-100 rounded-2xl hover:bg-blue-50"><Plus size={20} /> Add Exercise</button>
          <button onClick={handleSave} className="w-full bg-green-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2"><CheckCircle size={20} /> {editId ? "Update Changes" : "Save to Cloud"}</button>
        </div>
      )}
    </div>
  );
}

export default App;