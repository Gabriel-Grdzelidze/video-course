export const uploadToS3 = async (file: File) => {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, fileType: file.type }),
    });
  
    if (!res.ok) throw new Error("Failed to get upload URL");
  
    const { uploadUrl, fileUrl } = await res.json();
  
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
  
    if (!uploadRes.ok) throw new Error("S3 upload failed");
  
    return fileUrl;
  };