import type { Metadata } from "next";
import LegalArticle from "@/components/LegalArticle";
import { privacyPolicy } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | Quanti",
  description: "How Quanti collects, stores, and deletes health, screen-time, financial, and social data.",
};

export default function PrivacyPolicyPage() {
  return <LegalArticle document={privacyPolicy} />;
}
