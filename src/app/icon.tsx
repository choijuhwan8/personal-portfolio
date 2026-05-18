import { ImageResponse } from "next/og";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(
    <div style={{ width:32,height:32,background:"#0d0e10",border:"1px solid #00e5ff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:18,fontWeight:700,color:"#00e5ff",letterSpacing:"-0.04em" }}>CJ</div>,
    { ...size }
  );
}
