import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Config/Firebaseconfig.js";
import { useDispatch, useSelector } from "react-redux";
import { setAuthLoading } from "../Redux/Slice/AuthSlice";
import { useNavigate } from "react-router";

function Login() {
  const { role, isAuthenticated, loading } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [firebaseError, setFirebaseError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔑 1. Watch for Auth State changes
  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, role, navigate]);

  const onSubmit = (data) => {
    setFirebaseError("");
    dispatch(setAuthLoading(true));

    signInWithEmailAndPassword(auth, data.email, data.password)
      .then(() => {
        console.log("Login signal sent. Waiting for AuthListener...");
        
      })
      .catch((error) => {
        setFirebaseError(error.message);
        dispatch(setAuthLoading(false));
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email required" })}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password required" })}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
          
          {firebaseError && <p className="text-red-500 text-sm">{firebaseError}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white p-3 rounded-md ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;