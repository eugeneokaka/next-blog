import { forwardRef, useImperativeHandle, useState } from "react";

// Define the props for ImageUpload
type ImageUploadProps = {
  onPreview: (url: string) => void;
};

// Define the methods exposed via ref
export type ImageUploadRef = {
  uploadImage: () => Promise<string | null>;
};

const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(
  ({ onPreview }, ref) => {
    const [file, setFile] = useState<File | null>(null);

    useImperativeHandle(ref, () => ({
      async uploadImage() {
        if (!file) return null;

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        const url = data.url;

        if (url) {
          onPreview(url);
          return url;
        }

        return null;
      },
    }));

    return (
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          setFile(f);
          if (f) {
            const previewUrl = URL.createObjectURL(f);
            onPreview(previewUrl); // Just a local preview
          }
        }}
      />
    );
  }
);

export default ImageUpload;


// "use client";

// import { useState } from "react";

// export default function ImageUpload({
//   onUpload,
// }: {
//   onUpload: (url: string) => void;
// }) {
//   const [image, setImage] = useState<File | null>(null);
//   const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleUpload = async () => {
//     if (!image) return;

//     setLoading(true);
//     setError(null);

//     const formData = new FormData();
//     formData.append("file", image);

//     try {
//       const res = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();

//       if (data.url) {
//         setUploadedUrl(data.url);
//         onUpload(data.url); // call the parent handler
//       } else {
//         setError(data.error || "Upload failed");
//       }
//     } catch (err) {
//       setError("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <input
//         type="file"
//         onChange={(e) => setImage(e.target.files?.[0] || null)}
//       />
//       <button onClick={handleUpload} disabled={loading}>
//         {loading ? "Uploading..." : "Upload"}
//       </button>

//       {uploadedUrl && (
//         <div>
//           <p>✅ Image uploaded successfully!</p>
//           <img src={uploadedUrl} alt="Uploaded" className="w-40 mt-2 rounded" />
//         </div>
//       )}

//       {error && <p className="text-red-500">❌ {error}</p>}
//     </div>
//   );
// }
