"use client";
import Buttons from "./components/button";
import Navbar from "./components/nav";
import PostSearchFilter from "./components/posts";
import Posts from "./components/posts";
import ImageUpload from "./components/uplaod";

export default function Page() {
  const handleImageUpload = (url: string) => {
    console.log("Uploaded Image URL:", url);
    // Save the image URL to form state or submit it to your backend
  };

  return (
    <div>
      {/* <ImageUpload onPreview={handleImageUpload} /> */}

      <PostSearchFilter />
    </div>
  );
}
