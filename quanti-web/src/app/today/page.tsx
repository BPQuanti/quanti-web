import TodayHub from "@/components/app/TodayHub";

export const metadata = {
  title: "Quanti | Today",
  description: "The Quanti Today Hub — one morning check-in, one directive.",
};

export default function TodayPage() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <TodayHub />
    </div>
  );
}
