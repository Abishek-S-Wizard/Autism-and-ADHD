import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'research-papers';

export const researchService = {
  /**
   * Upload a new research paper (metadata + optional file)
   */
  async uploadPaper(paperData, userId, isAdmin = false) {
    let fileUrl = paperData.file_url;

    // If a file object is provided, upload it to Supabase Storage
    if (paperData.file && paperData.file instanceof File) {
      const fileExt = paperData.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, paperData.file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      fileUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('research_papers')
      .insert({
        title: paperData.title,
        description: paperData.description,
        author_name: paperData.author_name,
        file_url: fileUrl,
        uploaded_by: userId,
        status: isAdmin ? 'approved' : 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch papers with 'approved' status
   */
  async fetchApprovedPapers() {
    const { data, error } = await supabase
      .from('research_papers')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch papers uploaded by a specific user
   */
  async fetchMyPapers(userId) {
    const { data, error } = await supabase
      .from('research_papers')
      .select('*')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Admin: Fetch all papers (pending, approved, rejected)
   */
  async fetchAllPapers() {
    const { data, error } = await supabase
      .from('research_papers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Admin: Update paper status
   */
  async updatePaperStatus(paperId, status) {
    const { data, error } = await supabase
      .from('research_papers')
      .update({ status })
      .eq('id', paperId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * General: Delete a paper
   */
  async deletePaper(paperId) {
    const { error } = await supabase
      .from('research_papers')
      .delete()
      .eq('id', paperId);

    if (error) throw error;
    return true;
  }
};
