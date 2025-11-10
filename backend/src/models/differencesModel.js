import { supabase } from "../config/supabaseClient.js";

const TABLE = "reading_differences";

function normalize(row) {
  if (!row) return row;
  return {
    ...row,
    temperature: row.temperature === null ? null : Number(row.temperature),
    threshold_value: row.threshold_value === null ? null : Number(row.threshold_value),
    difference: row.difference === null ? null : Number(row.difference),
  };
}

export const DifferencesModel = {
  async list() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, temperature, threshold_value, difference, recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data.map(normalize);
  },

  async latest() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, temperature, threshold_value, difference, recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return normalize(data);
  },

  async create(payload) {
    const { temperature, threshold_value, difference } = payload;

    if (typeof temperature !== "number") {
      throw new Error("temperature must be a number");
    }
    if (typeof threshold_value !== "number") {
      throw new Error("threshold_value must be a number");
    }
    if (typeof difference !== "number") {
      throw new Error("difference must be a number");
    }

    const row = {
      temperature,
      threshold_value,
      difference,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(row)
      .select("id, temperature, threshold_value, difference, recorded_at")
      .single();

    if (error) throw error;
    return normalize(data);
  },
};
