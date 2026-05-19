import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type UserRole =
  | 'customer'
  | 'installer'
  | 'owner'
  | 'vertrieb'
  | 'projektleiter'
  | 'monteur'
  | 'backoffice'
  | 'super_employee';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  zip: string | null;
  is_verified: boolean;
  owner_id: string | null;
}

export const EMPLOYEE_ROLES: UserRole[] = [
  'installer', 'vertrieb', 'projektleiter', 'monteur', 'backoffice', 'super_employee',
];

export const MANAGER_ROLES: UserRole[] = ['owner', 'super_employee'];

export function isOwner(role: UserRole): boolean {
  return role === 'owner';
}

export function isEmployee(role: UserRole): boolean {
  return EMPLOYEE_ROLES.includes(role);
}

export function isSuperEmployee(role: UserRole): boolean {
  return role === 'super_employee';
}

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, phone, zip, is_verified, owner_id')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function signIn(email: string, password: string): Promise<Session> {
  const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(mapAuthError(error.message));
  if (!session) throw new Error('Anmeldung fehlgeschlagen.');
  return session;
}

export async function signUpCustomer(
  email: string,
  password: string,
  fullName: string
): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: 'customer', full_name: fullName } },
  });
  if (error) throw new Error(mapAuthError(error.message));
}

export async function signUpInstaller(
  email: string,
  password: string,
  companyName: string,
  zip: string,
  phone?: string,
): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: 'installer', full_name: companyName, zip, phone: phone || null } },
  });
  if (error) throw new Error(mapAuthError(error.message));
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'E-Mail oder Passwort falsch.';
  if (message.includes('Email not confirmed')) return 'Bitte bestätige zuerst deine E-Mail.';
  if (message.includes('User already registered')) return 'Diese E-Mail ist bereits registriert.';
  if (message.includes('Password should be at least')) return 'Passwort muss mindestens 6 Zeichen haben.';
  return message;
}
