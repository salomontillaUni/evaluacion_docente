"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Cliente de administración (solo para uso en el servidor)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ¡Asegúrate de agregar esto a tu .env!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function createAuthUser(data: {
  email: string;
  full_name: string;
  role: "estudiante" | "docente";
  codigo_o_depto: string; // codigo_estudiante o id_departamento
}) {
  try {
    // 1. Crear el usuario en Supabase Auth
    // Usamos 'testuser' como contraseña predeterminada
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: "testuser",
      email_confirm: true,
      user_metadata: { full_name: data.full_name }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("No se pudo crear el usuario en Auth");

    const userId = authData.user.id;

    // 2. Crear el registro en la tabla pública 'users'
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: userId,
        full_name: data.full_name,
        email: data.email,
        role: data.role
      }]);

    if (userError) throw userError;

    // 3. Crear el registro en la tabla específica (estudiantes o docentes)
    if (data.role === "estudiante") {
      const { error: studentError } = await supabaseAdmin
        .from('estudiantes')
        .insert([{
          user_id: userId,
          codigo_estudiante: data.codigo_o_depto
        }]);
      if (studentError) throw studentError;
    } else {
      const { error: teacherError } = await supabaseAdmin
        .from('docentes')
        .insert([{
          user_id: userId,
          departamento_id: parseInt(data.codigo_o_depto) || null
        }]);
      if (teacherError) throw teacherError;
    }

    revalidatePath("/views/admin");
    return { success: true, userId };

  } catch (error: any) {
    console.error("Error en createAuthUser:", error);
    return { success: false, error: error.message };
  }
}
