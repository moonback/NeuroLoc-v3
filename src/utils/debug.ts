import { supabase } from '../services/supabase';

export const debugAuth = async () => {
  console.log('=== DEBUG AUTH ===');
  
  // Vérifier l'utilisateur actuel
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('User:', user);
  console.log('User Error:', userError);
  
  if (user) {
    // Vérifier le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    console.log('Profile:', profile);
    console.log('Profile Error:', profileError);
    
    // Vérifier les objets de cet utilisateur
    const { data: objects, error: objectsError } = await supabase
      .from('objects')
      .select('*')
      .eq('owner_id', user.id);
    
    console.log('Objects:', objects);
    console.log('Objects Error:', objectsError);
    
    // Vérifier tous les objets (pour debug)
    const { data: allObjects, error: allObjectsError } = await supabase
      .from('objects')
      .select('*');
    
    console.log('All Objects:', allObjects);
    console.log('All Objects Error:', allObjectsError);
  }
  
  console.log('=== END DEBUG ===');
};

export const debugObjects = async () => {
  console.log('=== DEBUG OBJECTS ===');
  
  const { data: objects, error } = await supabase
    .from('objects')
    .select(`
      *,
      owner:profiles(*)
    `);
  
  console.log('Objects with owners:', objects);
  console.log('Error:', error);
  
  console.log('=== END DEBUG OBJECTS ===');
};
