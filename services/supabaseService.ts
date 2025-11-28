import { createClient, Session } from '@supabase/supabase-js';
import { HistoryItem, TranslationResult, BookExplanation, AuthorExplanation, LibraryBookMetadata } from '../types.ts';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is not defined. Please check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- AUTH FUNCTIONS ---
export const signUp = async (email: string, password: string) => supabase.auth.signUp({ email, password });
export const signIn = async (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });
export const signOut = async () => supabase.auth.signOut();
export const getSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return data.session;
};
export const onAuthStateChange = (callback: (session: Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return subscription;
};

// --- USER-SPECIFIC DATA FUNCTIONS ---
export const getHistory = async (): Promise<HistoryItem[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('history')
    .select('id, created_at, arabic_preview, translation_preview, full_result')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) { console.error("Error fetching history:", error); return []; }
  
  return data.map((item: any) => ({
    id: item.id,
    timestamp: new Date(item.created_at).getTime(),
    arabicPreview: item.arabic_preview,
    translationPreview: item.translation_preview,
    fullResult: item.full_result as TranslationResult,
  }));
};

export const addHistoryItem = async (item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<any> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  
  const { data, error } = await supabase
    .from('history')
    .insert({
      user_id: session.user.id,
      arabic_preview: item.arabicPreview,
      translation_preview: item.translationPreview,
      full_result: item.fullResult,
    });

  if (error) console.error("Error adding history:", error);
  return data;
};

export const deleteHistoryItem = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from('history').delete().eq('id', id);
    if (error) console.error('Error deleting history item:', error);
};

export const clearHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from('history').delete().eq('user_id', session.user.id);
    if (error) console.error('Error clearing history:', error);
};

// --- PUBLIC CACHE FUNCTIONS ---

export const getPublicAnalysis = async (hash: string): Promise<TranslationResult | null> => {
    const { data, error } = await supabase
        .from('public_analyses')
        .select('full_result')
        .eq('source_text_hash', hash)
        .single();
    if (error) { return null; }
    return data?.full_result as TranslationResult;
};

export const getPublicBookMetadata = async (bookId: string): Promise<LibraryBookMetadata | null> => {
    const { data, error } = await supabase
        .from('public_book_metadata')
        .select('full_metadata')
        .eq('id', bookId)
        .single();
    if (error) { return null; }
    return data?.full_metadata as LibraryBookMetadata;
};

export const getPublicAuthorBio = async (authorId: string): Promise<AuthorExplanation | null> => {
    const { data, error } = await supabase
        .from('public_author_bios')
        .select('full_bio')
        .eq('id', authorId)
        .single();
    if (error) { return null; }
    return data?.full_bio as AuthorExplanation;
};

export const getRecentPublicAnalyses = async (limit: number = 5): Promise<any[]> => {
    const { data, error } = await supabase
        .from('public_analyses')
        .select('source_text, full_result')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) { console.error("Error fetching recent analyses:", error); return []; }
    return data;
};
