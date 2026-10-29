import type { Metadata } from "next";
import LegalArticle from "@/components/LegalArticle";
import { privacyPolicy } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | Quanti",
  description: "How Quanti uses your destination, optional HealthKit, and a short voice check to write one daily 1%.",
};

export default function PrivacyPolicyPage() {
  return <LegalArticle document={privacyPolicy} />;
}
