import PageHeader from "../components/PageHeader";
import HowItWorks from "../components/HowItWorks";

export default function LearnPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader title="How it works" subtitle="The nerdy bits, with zero judgment and lots of cheering." pattern="waves" />
      <HowItWorks defaultOpen />
    </main>
  );
}