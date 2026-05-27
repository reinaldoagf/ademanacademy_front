// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  Play,
  Star,
  MapPin,
  Clock,
  Phone
} from "lucide-react";

// --- DATOS DE LOS SLIDES ---
const SLIDES = [
  {
    tag: "Gala Anual 2026",
    title: "El Arte de la Disciplina",
    description: "Formamos bailarines integrales con técnica rusa de Ballet Clásico y expresión contemporánea.",
    image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?q=80&w=2070&auto=format&fit=crop",
  },
  {
    tag: "Nuevas Inscripciones",
    title: "Encuentra tu Ritmo",
    description: "Desde los 3 años hasta niveles avanzados. Un espacio donde la pasión se convierte en movimiento.",
    image: "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1887&auto=format&fit=crop",
  },
  {
    tag: "Cuerpo Docente",
    title: "Maestros del Escenario",
    description: "Aprende de profesionales certificados con trayectoria internacional en las mejores compañías.",
    image: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?q=80&w=1910&auto=format&fit=crop",
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white font-questrial selection:bg-purple-200">

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full h-20 px-6 md:px-12 flex items-center justify-between z-50 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="relative h-9 w-28">
          <Image
            src="/img/logo1.png"
            alt="Logo"
            width={110}
            height={36}
            className="brightness-0 invert h-auto w-full"
            priority
          />
        </div>
        <div className="hidden md:flex gap-8 text-white text-xs font-bold uppercase tracking-widest">
          <a href="#academia" className="hover:text-purple-300 transition-colors">La Academia</a>
          <a href="#disciplinas" className="hover:text-purple-300 transition-colors">Disciplinas</a>
          <a href="#contacto" className="hover:text-purple-300 transition-colors">Contacto</a>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="cursor-pointer font-anton uppercase text-xs px-6 py-2.5 bg-white text-[#5e0472] hover:bg-purple-100 transition-all shadow-xl"
        >
          Portal Alumnos
        </button>
      </nav>

      {/* --- HERO SLIDER --- */}
      <section className="relative h-screen w-full overflow-hidden bg-neutral-950">
        {SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-[1500ms] ease-in-out ${index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none"
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10" />

            {/* 💡 Usamos img nativo con unloader/unoptimized para mitigar problemas locales de SSL */}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />

            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-purple-500/20 border border-purple-400/30 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-200">{slide.tag}</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-anton text-white uppercase leading-none mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {slide.title}
              </h1>
              <p className="text-sm md:text-lg text-gray-300 max-w-xl mb-10 font-light leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
                {slide.description}
              </p>
              <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                <button onClick={() => router.push("/login")} className="cursor-pointer px-8 py-4 bg-white font-anton text-[#5e0472] uppercase text-xs tracking-widest hover:bg-purple-50 transition-all flex items-center gap-2">
                  Empezar ahora <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-8 py-4 border border-white/30 text-white font-anton uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md">
                  Ver Video <Play className="w-3 h-3 fill-white" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {/* Progress Bars */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {SLIDES.map((_, i) => (
            <div key={i} className="h-1 w-16 bg-white/20 rounded-full overflow-hidden">
              <div className={`h-full bg-purple-500 transition-all duration-[6000ms] ease-linear ${i === currentSlide ? "w-full" : "w-0"}`} />
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN: NUESTRA ESENCIA --- */}
      <section id="academia" className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative aspect-[4/5] w-full bg-neutral-100">
          <img
            src="https://images.unsplash.com/photo-1518834107812-67b0b7c58434?q=80&w=1935&auto=format&fit=crop"
            alt="Ensayo"
            className="w-full h-full object-cover shadow-2xl"
          />
          <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#5e0472] p-8 text-white hidden md:block z-20">
            <Star className="w-8 h-8 mb-4 text-pink-400" />
            <p className="font-anton text-2xl uppercase leading-tight">15 años formando estrellas</p>
            <p className="text-[10px] mt-2 font-light opacity-80">Nuestra excelencia académica es reconocida en todo el país.</p>
          </div>
        </div>
        <div className="space-y-8">
          <span className="text-[#5e0472] font-bold uppercase tracking-[0.3em] text-[10px]">Sobre Ademan Academy</span>
          <h2 className="text-4xl md:text-6xl font-anton text-gray-900 uppercase leading-none">Donde el cuerpo <br /> <span className="text-[#5e0472]">habla el lenguaje del alma</span></h2>
          <p className="text-gray-500 leading-relaxed text-sm">
            En Ademan Academy, creemos que la danza es más que una serie de pasos; es una forma de vida. Nuestra metodología combina la rigurosidad técnica con la libertad creativa, proporcionando a cada alumno las herramientas necesarias para alcanzar su máximo potencial artístico y personal.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <h4 className="font-anton text-3xl text-gray-800">500+</h4>
              <p className="text-[10px] uppercase text-gray-400 font-bold">Alumnos Activos</p>
            </div>
            <div>
              <h4 className="font-anton text-3xl text-gray-800">24</h4>
              <p className="text-[10px] uppercase text-gray-400 font-bold">Maestros Certificados</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN: DISCIPLINAS --- */}
      <section id="disciplinas" className="py-24 bg-neutral-50 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-anton text-gray-900 uppercase">Nuestras Disciplinas</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm font-light">Explora la variedad de estilos que ofrecemos, diseñados para todas las edades y niveles de experiencia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Ballet Clásico", img: "https://images.unsplash.com/photo-1519340241574-20ec888bc541?q=80&w=1921&auto=format&fit=crop" },
              { title: "Danza Contemporánea", img: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?q=80&w=1910&auto=format&fit=crop" },
              { title: "Flamenco", img: "https://images.unsplash.com/photo-1621976498727-9e5d56476276?q=80&w=2070&auto=format&fit=crop" },
              { title: "Danza Urbana", img: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?q=80&w=2070&auto=format&fit=crop" }
            ].map((d, i) => (
              <div key={i} className="group relative aspect-[3/4] overflow-hidden bg-black">
                <img
                  src={d.img}
                  alt={d.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                  <h3 className="font-anton text-2xl text-white uppercase tracking-wide group-hover:text-pink-400 transition-colors">{d.title}</h3>
                  <button className="text-white text-[10px] font-bold uppercase tracking-widest mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 cursor-pointer">
                    Ver horarios <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECCIÓN: CTA --- */}
      <section className="py-24 px-6 md:px-12 text-center bg-[#5e0472] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 text-white font-anton text-[20vw] leading-none select-none">ADEMAN</div>
        </div>
        <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-7xl font-anton text-white uppercase leading-none">¿Listo para subir <br /> al escenario?</h2>
          <p className="text-purple-200 text-sm md:text-lg font-light max-w-2xl mx-auto">
            Únete a nuestra familia y comienza tu formación artística hoy mismo. Cupos limitados para el período escolar 2026.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="cursor-pointer px-12 py-5 bg-white text-[#5e0472] font-anton text-sm tracking-[0.2em] uppercase hover:bg-pink-50 transition-all shadow-2xl"
          >
            Regístrate e inscríbete aquí
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="contacto" className="bg-neutral-950 text-white pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 border-b border-white/5 pb-16">
          <div className="space-y-6">
            <div className="relative h-9 w-28">
              <Image src="/img/logo1.png" alt="Logo" width={120} height={35} className="brightness-0 invert h-auto w-full" />
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">Excelencia académica en formación artística. Pasión, técnica y disciplina desde hace 15 años.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer"><Star className="w-4 h-4" /></div>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer"><Star className="w-4 h-4" /></div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-anton text-sm uppercase tracking-widest text-purple-400">Ubicación</h4>
            <div className="space-y-4 text-xs text-gray-400">
              <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-pink-500" /> <span>Av. Principal de las Artes, <br /> Edificio Ademan, Nivel 2.</span></div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-pink-500" /> <span>+58 412-1234567</span></div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-anton text-sm uppercase tracking-widest text-purple-400">Horarios</h4>
            <div className="space-y-4 text-xs text-gray-400">
              <div className="flex items-start gap-3"><Clock className="w-4 h-4 text-pink-500" /> <span>Lunes a Viernes: <br /> 2:00 PM - 8:00 PM</span></div>
              <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-pink-500" /> <span>Sábados: 9:00 AM - 1:00 PM</span></div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-anton text-sm uppercase tracking-widest text-purple-400">Newsletter</h4>
            <p className="text-gray-500 text-xs">Recibe información sobre galas y eventos.</p>
            <div className="flex flex-col gap-2">
              <input type="email" placeholder="Tu correo" className="bg-white/5 border border-white/10 px-4 py-2 text-xs focus:outline-none focus:border-purple-500 transition-colors" />
              <button className="bg-purple-600 px-4 py-2 text-xs font-anton uppercase tracking-widest hover:bg-purple-700 transition-colors">Suscribir</button>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-600 uppercase tracking-[0.2em]">© 2026 Ademan Academy. Todos los derechos reservados. Desarrollado por Ademan Tech.</p>
      </footer>
    </div>
  );
}