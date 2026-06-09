import logo from "@/assets/harbole-logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Harbole — बुंदेलखंड की आवाज़"
      className={`object-contain drop-shadow-[0_2px_6px_rgba(11,27,43,0.18)] ${className}`}
      width={240}
      height={300}
    />
  );
}
