"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  // Load bookmarks
  const loadBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setBookmarks(data);
  };

  useEffect(() => {
    loadBookmarks();

    // Realtime updates
    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => loadBookmarks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Add bookmark
  const addBookmark = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: user.id,
    });

    setTitle("");
    setUrl("");
  };

  // Delete bookmark
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4 font-bold">My Bookmarks</h1>

      {/* Add Form */}
      <div className="flex gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border p-2 flex-1"
        />

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL"
          className="border p-2 flex-1"
        />

        <button
          onClick={addBookmark}
          className="bg-green-600 text-white px-4"
        >
          Add
        </button>
      </div>

      {/* List */}
      {bookmarks.map((b) => (
        <div
          key={b.id}
          className="flex justify-between border p-2 mb-2"
        >
          <a href={b.url} target="_blank">
            {b.title}
          </a>

          <button
            onClick={() => deleteBookmark(b.id)}
            className="text-red-600"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
