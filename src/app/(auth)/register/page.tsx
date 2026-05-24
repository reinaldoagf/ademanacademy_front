"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Mail,
  Lock,
  ChevronRight,
  ShieldCheck,
  Globe,
  Star,
} from "lucide-react";

export default function RegisterPage() {
  const [metodo, setMetodo] = useState<"login" | "otp" | "registro">("login");
  const [email, setEmail] = useState("");
  return (
    <div className="w-full max-w-md space-y-8">
      {/* Glass Card */}
      <div className="border border-white/10 p-8 md:p-10 relative overflow-hidden">
        {/* Decoración de fondo de la tarjeta */}

        <header className="relative z-10 text-center mb-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/img/logo1.png"
              alt="Logo"
              width={256}
              height={86}
              priority
            />
          </div>
          <h3 className="text-3xl font-anton tracking-tight">
            Bienvenido Alumno
          </h3>
          <p className="text-gray-400 text-sm mt-2">
            Tu camino a la excelencia comienza aquí
          </p>
        </header>

        {/* Tabs Minimalistas */}
        <div className="flex justify-center gap-8 mb-8 border-b border-white/5 pb-4 relative z-10">
          {["login", "otp", "registro"].map((t) => (
            <button
              key={t}
              onClick={() => setMetodo(t as any)}
              className={`cursor-pointer text-xs font-bold uppercase tracking-widest transition-all relative ${
                metodo === t
                  ? "text-[#5e0472]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t}
              {metodo === t && (
                <span className="absolute -bottom-[17px] left-0 w-full h-0.5 bg-[#5e0472] shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
              )}
            </button>
          ))}
        </div>

        {/* Formulario */}
        <form className="space-y-5 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Email Institucional
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="email"
                placeholder="alumno@academia.com"
                className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          {metodo !== "otp" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          )}

          <button className="w-full cursor-pointer group font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90">
            <span>{metodo === "otp" ? "Enviar Código" : "Entrar al Aula"}</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <footer className="mt-8 text-center space-y-4 relative z-10">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            O accede con
          </p>
          <div className="flex justify-center gap-4">
            <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Globe className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <ShieldCheck className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </footer>
      </div>

      {/* Badge de Confianza Inferior */}
      <div className="flex items-center justify-center gap-6 text-gray-600 opacity-50 grayscale hover:opacity-100 transition-all duration-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            SSL Secure
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Global Access
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Top Rated
          </span>
        </div>
      </div>
    </div>
  );
}
