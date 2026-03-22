export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", "imageforDG")

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/duvdkladk/image/upload",
    {
      method: "POST",
      body: formData
    }
  )

  if (!res.ok) {
    throw new Error("Upload failed")
  }

  const data = await res.json()
  return data.secure_url as string
}