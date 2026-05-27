import { supabase } from "../libs/supabase.js";

export const uploadToSupabase = async (file, folderName) => {
  if (!file) throw new Error("File is required");

  // file xtension and path
  const fileExtension = file.originalname.split(",").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

  const filePath = `${folderName}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("BangoParc_bucket")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("BangoParc_bucket")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};
