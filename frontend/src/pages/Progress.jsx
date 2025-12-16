import ProgressChart from "../components/ProgressChart";

export default function Progress({ token }) {
  const authToken = token || localStorage.getItem("token");

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ color: "white" }}>Прогрес учня</h1>

      <ProgressChart token={authToken} />
    </div>
  );
}
