import type { Metadata } from "next";
import LegalArticle from "@/components/LegalArticle";
import { termsOfService } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of Service | Quanti",
  description: "Terms for the Quanti app, including subscriptions and the coaching disclaimer.",
};

export default function TermsOfServicePage() {
  return <LegalArticle document={termsOfService} />;
}
