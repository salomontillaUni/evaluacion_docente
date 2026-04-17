import { ConnectorConfig, DataConnect, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  email: string;
  nombre: string;
  role: string;
}

export interface Departamento_Key {
  id: UUIDString;
  __typename?: 'Departamento_Key';
}

export interface Docente_Key {
  id: UUIDString;
  __typename?: 'Docente_Key';
}

export interface Estudiante_Key {
  id: UUIDString;
  __typename?: 'Estudiante_Key';
}

export interface Evaluacion_Key {
  id: UUIDString;
  __typename?: 'Evaluacion_Key';
}

export interface Materia_Key {
  id: UUIDString;
  __typename?: 'Materia_Key';
}

export interface PeriodoAcademico_Key {
  id: UUIDString;
  __typename?: 'PeriodoAcademico_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

