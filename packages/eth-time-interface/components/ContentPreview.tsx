import React from "react";

interface ContentPreviewProps {
  data?: string;
}

export function ContentPreview({ data }: ContentPreviewProps) {
  if (data) {
    return <img src={data} />;
  }
  return <div>gm</div>;
}
