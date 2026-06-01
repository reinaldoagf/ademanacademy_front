// src/app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export async function handleLogin(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // 💡 1. Consumimos el json una única vez aquí
    const data = await response.json();

    // 💡 2. Si hay un error, usamos los datos que ya guardamos en la variable 'data'
    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Error al iniciar sesión"
      };
    }

    // Capturar la cookie Set-Cookie enviada por NestJS y replicarla en Next.js
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      const token = setCookieHeader.split(";")[0].split("=")[1];
      const cookieStore = await cookies();
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }

    return {
      success: true,
      user: data.user || data
    };
  } catch (err: any) {
    // Evitamos mapear propiedades anidadas inexistentes como 'err.data' que provocan más undefineds
    const message = err?.message || "Fallo de comunicación con el backend";
    console.error({ message });
    return { success: false, error: message };
  }
}

export async function handleRegister(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!name || !email || !password) {
    return { success: false, error: "Todos los campos obligatorios son requeridos" };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Error en el servidor de registro" };
    }

    // Capturar la cookie Set-Cookie enviada por NestJS y replicarla en Next.js
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      const token = setCookieHeader.split(";")[0].split("=")[1];
      const cookieStore = await cookies();
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }

    return {
      success: true,
      user: data.user || data
    };

  } catch (err: any) {
    const message = err?.message || "Fallo de comunicación con el backend";
    console.error({ message });
    return { success: false, error: message };
  }
}

export async function handleLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/login");
}