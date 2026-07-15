import React from "react";

export default function StarRating({ rating, onRate }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate && onRate(star)}
          className={`text-xl ${star <= rating ? "text-yellow-400" : "text-slate-200"} ${onRate ? "cursor-pointer hover:scale-110 transition" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}