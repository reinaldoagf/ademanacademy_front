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


    const data = await response.json();
    console.log({ data })

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || "Error al iniciar sesión" };
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

    // Retorna la respuesta satisfactoria en formato API que el frontend espera recibir
    return {
      success: true,
      user: data.user || data
    };
  } catch (err) {
    return { success: false, error: "Fallo de comunicación con el backend" };
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

    // 🍪 Si tu backend retorna un token, lo guardamos de forma segura en las cookies
    if (data.token) {
      const cookieStore = await cookies();
      cookieStore.set("auth_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: "/",
      });
    }

    // Retorna la respuesta satisfactoria en formato API que el frontend espera recibir
    return {
      success: true,
      user: data.user || data
    };

  } catch (err) {
    return { success: false, error: "Fallo de comunicación con el backend" };
  }
}

export async function handleLogout() {
  const cookieStore = await cookies();

  // Eliminamos la cookie del navegador asignándole una fecha de expiración pasada
  cookieStore.delete("auth_token");

  // Opcional: Si tu backend requiere invalidar el token o la sesión en Redis/DB, 
  // puedes hacer un fetch a ${BACKEND_URL}/auth/logout aquí antes de borrar la cookie.

  // Redirigimos al usuario al login
  redirect("/login");
}