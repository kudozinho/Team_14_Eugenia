import AuthForm from "@/components/AuthForm";

export default function Page() {
  return (
    <section className="wrap" style={{ padding: "40px", margin: 0 }}>
      <h1>Se connecter</h1>
      <p style={{ margin: "8px 0 24px" }}>Retrouve ton espace Ghost.</p>
      <AuthForm mode="connexion" />
    </section>
  );
}
