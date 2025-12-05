export interface Curso {
    id: number;
    curso: string;
    turno: string;

}

export interface CursoData {
    cursos: Curso[];
    curso_seleccionado?: Curso;
}
export interface Alumno {
    id: string | undefined;
    nombre: string | undefined;
    apellido: string | undefined;
    dni: number | undefined;
    email: string | undefined;
    domicilio: string | undefined;
    telefono_padre: string | undefined;
    nacimiento: string | undefined;
    id_curso: string | undefined;
}