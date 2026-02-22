import { supabase } from './supabase';

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// ============================================
// PROFILE PICTURE
// ============================================

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  // Always use jpg to keep filePath consistent across uploads
  const contentType = 'image/jpeg';
  const filePath = `${userId}.jpg`;

  // Read the file as ArrayBuffer (more reliable than blob in React Native)
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  // Upload to Supabase Storage (upsert to overwrite existing)
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  // Store URL in user metadata
  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl },
  });

  if (updateError) throw updateError;

  // Also update profiles table if it exists
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .then(() => {})
    .catch(() => {});

  return publicUrl;
}

export function getAvatarUrl(user: any): string | null {
  return user?.user_metadata?.avatar_url || null;
}

// ============================================
// ACCOUNT DELETION
// ============================================

export async function requestAccountDeletion(userId: string, email: string, name: string, reason?: string): Promise<void> {
  const { error } = await supabase
    .from('account_deletion_requests')
    .insert({
      user_id: userId,
      user_email: email,
      user_name: name,
      reason: reason || null,
    });
  if (error) throw error;
}
