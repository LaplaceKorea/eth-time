import React from "react";
import { styled } from '../stitches.config'

const StyledImg = styled('img', {
    objectFit: "contain",
    width: "100%",
    height: "100%",
})

interface ContentPreviewProps {
  data?: string;
}

export function ContentPreview({ data }: ContentPreviewProps) {
  if (data) {
    return <StyledImg src={data} />;
  }
  return <div>gm</div>;
}
