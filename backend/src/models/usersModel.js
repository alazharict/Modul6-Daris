import { supabase } from "../config/supabaseClient.js";

const TABLE = "users";

export const UsersModel = {
  async findByEmail(email) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, email, name, created_at")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(userData) {
    const { email, password, name } = userData;
    
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        email: email.toLowerCase(),
        password_hash: password, // In production, this should be hashed
        name: name || null,
      })
      .select("id, email, name, created_at")
      .single();

    if (error) throw error;
    return data;
  },

  async updatePassword(id, newPassword) {
    const { error } = await supabase
      .from(TABLE)
      .update({ 
        password_hash: newPassword, // In production, this should be hashed
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  async updateProfile(id, profileData) {
    const { name } = profileData;
    
    const updatePayload = {
      updated_at: new Date().toISOString()
    };
    
    if (name !== undefined) {
      updatePayload.name = name;
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(updatePayload)
      .eq("id", id)
      .select("id, email, name, created_at")
      .single();

    if (error) throw error;
    return data;
  }
};