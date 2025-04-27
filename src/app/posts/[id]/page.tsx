"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  views: number;
  imageUrl?: string;
  category: { name: string };
  user: {
    firstname: string;
    lastname: string;
    username: string;
    imageUrl?: string;
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

interface User {
  email: string;
  userId: string;
  username: string;
  firstname: string;
  lastname: string;
}

export default function SinglePostPage() {
  const { id } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) throw new Error("Failed to fetch user.");
        const data = await res.json();
        if (data?.user && isMounted) {
          setUser({
            email: data.user.email,
            userId: data.user.userId,
            username: data.user.username,
            firstname: data.user.firstname || data.user.username,
            lastname: data.user.lastname || "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (res.ok) {
          setPost(data);
        } else {
          throw new Error(data.error || "Failed to load post.");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    if (user && post) {
      setShowButton(user.username === post.user.username);
    }
  }, [user, post]);

  const handleDelete = async () => {
    if (!post) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete the post.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !post) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          userId: user.userId,
          postId: post.id,
        }),
      });

      if (res.ok) {
        const newCommentData = await res.json();
        setPost((prev) =>
          prev
            ? {
                ...prev,
                comments: [
                  {
                    id: newCommentData.id,
                    content: newCommentData.content,
                    createdAt: newCommentData.createdAt,
                    user: {
                      firstname: user.firstname,
                      lastname: user.lastname,
                    },
                  },
                  ...prev.comments,
                ],
              }
            : prev
        );
        setNewComment("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add comment.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while adding comment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading post...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white text-black">
      {post && (
        <>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p>views: {post.views}</p>

          {showButton && (
            <div className="mb-4">
              <Link href={`/posts/edit/${post.id}`}>
                <button className="bg-black text-white px-4 py-2 rounded mr-2">
                  Edit
                </button>
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
            {post.user.imageUrl && (
              <img
                src={post.user.imageUrl}
                alt={`${post.user.firstname} ${post.user.lastname}`}
                className="w-10 h-10 rounded-full object-cover"
                loading="lazy"
              />
            )}
            <span>By {post.user.username}</span>
            <span>•</span>
            <span>{post.category.name}</span>
          </div>

          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
              loading="lazy"
            />
          )}

          <div className="prose max-w-none text-lg mb-10">{post.content}</div>

          {/* Comments Section */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Comments</h2>

            {user && (
              <div className="mb-6">
                <textarea
                  className="w-full border rounded p-3 mb-2"
                  rows={3}
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  onClick={handleAddComment}
                  disabled={submitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Add Comment"}
                </button>
              </div>
            )}

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
