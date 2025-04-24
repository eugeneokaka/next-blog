"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "../components/uplaod";

export default function CreatePostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryName, setCategoryName] = useState("Technology");
  const [username, setUsername] = useState(""); // username input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const imageUrlRef = useRef<string | null>(null);
  const imageUploaderRef = useRef<{
    uploadImage: () => Promise<string | null>;
  }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Upload image on publish
      let imageUrl = imageUrlRef.current;

      if (imageUploaderRef.current) {
        imageUrl = await imageUploaderRef.current.uploadImage();
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          imageUrl,
          categoryName,
          username, // pass username instead of userId
        }),
      });
      if (res.status === 400) {
        alert("user or category not provided");
        return;
      }
      if (res.status === 404) {
        alert("user or category not found");
        return;
      }
      if (res.status === 201) {
        alert("post created successfully");
        router.push("/");
        return;
      } else {
        alert("post not created");
        return;
      }

      // if (!res.ok) throw new Error("Failed to create post");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Create New Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Your Username"
          className="w-full p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Write your post content..."
          className="w-full p-2 border rounded min-h-[150px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <select
          className="w-full p-2 border rounded"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        >
          <option value="Technology">Technology</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="food">Food</option>
        </select>

        {/* Image Upload is mounted but image isn't uploaded until publish */}
        <ImageUpload
          ref={imageUploaderRef}
          onPreview={(url) => {
            imageUrlRef.current = url;
          }}
        />

        {imageUrlRef.current && (
          <img
            src={imageUrlRef.current}
            alt="preview"
            className="w-40 rounded"
          />
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish Post"}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
}
