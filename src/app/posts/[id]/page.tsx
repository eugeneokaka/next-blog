"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category: {
    name: string;
  };
  user: {
    firstname: string;
    lastname: string;
    imageUrl?: string;
    username: string;
  };
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      firstname: string;
      lastname: string;
    };
  }[];
}

export default function SinglePostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [user, setUser] = useState<{
    email: string;
    userId: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (data.user) {
        setUser({
          email: data.user.email,
          userId: data.user.userId,
          username: data.user.username,
        });
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (res.ok) {
          setPost(data);
        } else {
          setError(data.error || "Failed to load post.");
        }
      } catch (err) {
        setError("Error fetching post.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id]);

  useEffect(() => {
    if (user && post && user.username === post.user.username) {
      setShowButton(true);
    }
  }, [user, post]);

  const handleDelete = async () => {
    if (!post) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete the post.");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading post...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white text-black">
      {post && (
        <>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          {showButton && (
            <div>
              <Link href={`/posts/edit/${post.id}`}>
                <button className="bg-black text-white px-4 py-2 rounded my-2">
                  Edit
                </button>
              </Link>

              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded my-2 ml-2 hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
            {post.user.imageUrl && (
              <img
                src={post.user.imageUrl}
                alt={`${post.user.firstname} ${post.user.username}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <span>
              By {post.user.username}
              <br />
            </span>
            <span>•</span>
            <span>{post.category.name}</span>
          </div>

          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
          )}

          <div className="prose max-w-none text-lg mb-10">{post.content}</div>

          {/* Comments */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Comments</h2>
            {post.comments.length === 0 ? (
              <p className="text-gray-500">No comments yet.</p>
            ) : (
              <ul className="space-y-4">
                {post.comments.map((comment) => (
                  <li key={comment.id} className="border-b pb-4">
                    <p className="font-semibold">
                      {comment.user.firstname} {comment.user.lastname}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                    <p>{comment.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
