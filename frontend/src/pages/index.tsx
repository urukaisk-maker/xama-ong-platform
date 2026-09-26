export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return (
    <main style={{padding:40, fontFamily:"system-ui"}}>
      <h1>XAMA-ONG Platform</h1>
      <p>API: {apiUrl}</p>
      <a href={apiUrl + "/docs"}>Ver API docs</a>
    </main>
  );
}
