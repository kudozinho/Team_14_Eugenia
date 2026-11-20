import AuthForm from "@/components/AuthForm";

export default function Page() {
  return (
    <section className="wrap" style={{ padding: "40px", margin: 0 }}>
      <h1>Créer mon compte</h1>
      <p style={{ margin: "8px 0 24px" }}>Quelques secondes pour commencer.</p>
      <AuthForm mode="inscription" />
    </section>
  );
}
