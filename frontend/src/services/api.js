
export async function fetchProtected(endpoint, getIdToken) {
  const token = await getIdToken();
  const res = await fetch(`/api/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}
