// app/lib/dataconnect.ts
import { getDataConnect } from "firebase/data-connect";
// Importamos también la configuración generada
import { createUser, connectorConfig } from "./dataconnect-generated";

export async function syncUserWithDataConnect(user: {
  email: string;
  nombre: string;
  role: "admin" | "docente" | "estudiante";
}) {
  try {
    // 1. Cargamos la instancia usando la configuración generada
    const dc = getDataConnect(connectorConfig);

    // 2. Ejecutamos la mutación
    await createUser(dc, {
      email: user.email,
      nombre: user.nombre,
      role: user.role,
    });

    return { success: true };
  } catch (error) {
    console.error("Error al sincronizar con Data Connect:", error);
    throw error;
  }
}
