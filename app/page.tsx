"use client";
import { BrainCircuit, GraduationCap, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


const navItems = [
  { to: "/views/estudiante", label: "Estudiante", icon: GraduationCap, description: "Evaluar docente" },
  { to: "/views/docente", label: "Docente", icon: UserRound, description: "Consultar resultados" },
  { to: "/views/admin", label: "Administrador", icon: ShieldCheck, description: "Dashboard y gestión" },
];

export default function Home() {
  return (
    <></>
  );
}
