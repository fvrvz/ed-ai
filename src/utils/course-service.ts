import { supabase } from './supabase';

export interface Course {
  id: string;
  title: string;
  description: string;
}

/**
 * Fetches only the courses assigned to the logged-in Member (individually or via group).
 */
export const fetchMyAssignedCourses = async (): Promise<Course[]> => {
  try {
    // Because of our RLS policies, simple select automatically filters 
    // out anything not explicitly mapped to this specific user context!
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description')
      .eq('is_published', true);

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Failed to fetch assigned course matrix:', error.message);
    throw error;
  }
};
