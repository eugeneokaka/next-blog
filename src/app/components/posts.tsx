"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  category: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/list-c");
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setError("Failed to load categories.");
        }
      } catch {
        setError("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (category) query.append("category", category);
        if (search) query.append("search", search);
        if (startDate) query.append("startDate", startDate);
        if (endDate) query.append("endDate", endDate);

        const res = await fetch(`/api/posts?${query.toString()}`);
        const data: Post[] = await res.json();
        setPosts(data);
      } catch {
        setError("Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category, search, startDate, endDate]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-white text-black">
      <h1 className="text-4xl font-bold mb-8 border-b border-gray-300 pb-4 text-center">
        Discover Posts
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="border border-gray-300 p-2 rounded"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        />
      </div>

      {loading && <p className="text-gray-600 text-center">Loading posts...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Posts Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="bg-gray-100 h-56 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

              <div className="p-4">
                <h2 className="text-xl font-bold mb-1">{post.title}</h2>
                <p className="text-sm text-gray-500 mb-2">
                  {post.category.name}
                </p>
                <p className="text-gray-700 text-sm">
                  {post.content.slice(0, 150)}...
                </p>
                <a
                  href={`/posts/${post.id}`}
                  className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline"
                >
                  Read more →
                </a>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No posts found
          </p>
        )}
      </div>
    </div>
  );
}
