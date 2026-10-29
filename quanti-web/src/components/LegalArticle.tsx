import Link from "next/link";
import Footer from "@/components/Footer";
import type { LegalDocument } from "@/content/legal";

export default function LegalArticle({ document }: { document: LegalDocument }) {
  return (
    <>
      <main className="mx-auto min-h-screen max-w-3xl bg-slate-950 px-6 py-16 font-sans text-slate-300 sm:px-12">
        <Link href="/" className="text-sm font-semibold text-slate-100 hover:text-indigo-300">
          ← Quanti
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-100 sm:text-4xl">{document.title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated {document.updated}</p>
        <div className="mt-8 space-y-8 text-sm leading-7 sm:text-base">
          {document.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-slate-100">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.blocks.map((block, index) =>
                  block.kind === "ul" ? (
                    <ul key={`${section.title}-${index}`} className="list-disc space-y-2 pl-6 text-slate-300">
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={`${section.title}-${index}`}>{block.text}</p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
