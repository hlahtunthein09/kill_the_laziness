"use client";

import type { SubPiece } from "@/lib/types";
import { SubPieceCard } from "./SubPieceCard";
import { Flower2 } from "lucide-react";

interface SubPieceListProps {
  subPieces: SubPiece[];
  projectId?: string;
}

export function SubPieceList({ subPieces, projectId }: SubPieceListProps) {
  if (subPieces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 gap-2 text-stone-400">
        <Flower2 className="h-6 w-6 text-stone-300" />
        <p className="text-sm text-stone-500">အခန်းကဏ္ဍများ မရှိသေးပါ</p>
        <p className="text-xs text-stone-400">No sub-pieces yet</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {subPieces.map((subPiece) => (
        <SubPieceCard key={subPiece.id} subPiece={subPiece} projectId={projectId ?? subPiece.projectId} />
      ))}
    </div>
  );
}
