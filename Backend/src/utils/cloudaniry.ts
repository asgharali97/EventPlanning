import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDNAIRY_CLOUD_NAME,
  api_key: process.env.CLOUDNAIRY_KEY,
  api_secret: process.env.CLOUDNAIRY_KEY_SECRET,
});

const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    
    if (!fs.existsSync(localFilePath)) {
      console.error("File does not exist:", localFilePath);
      return null;
    }
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    
    try {
      fs.unlinkSync(localFilePath);
    } catch (deleteError) {
      console.error("Error deleting local file:", deleteError);
    }
    
    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (deleteError) {
      console.error("Error deleting local file after failed upload:", deleteError);
    }
    
    return null;
  }
};

const deleteFromCloudinary = async (publicId : string) => {
  const id = publicId.split("/").pop()?.split(".")[0];
  if (!id) return null;
  try {
    return await cloudinary.uploader.destroy(id);
  } catch (error) {
    console.log("Error in deleting file from cloudinary ::", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };